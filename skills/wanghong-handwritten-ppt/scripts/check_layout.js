#!/usr/bin/env node

/**
 * WangHong PPT DOM Layout Audit
 *
 * Usage:
 *   node check_layout.js /absolute/path/to/index.html [N|all]
 *
 * Checks:
 *   - slide boundary overflow
 *   - major DOM block collisions
 *   - formula/body collisions
 *   - result-box collisions
 *   - table/SVG/code overflow
 *
 * Notes:
 *   - Uses Chrome directly; no Puppeteer dependency.
 *   - Each page is rendered through ?preview=N.
 *   - Parent/child containment is NOT considered a collision.
 */

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { pathToFileURL } from "node:url";

const CHROME =
  process.env.CHROME ||
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

const input = process.argv[2];
const countArg = process.argv[3] || "all";

if (!input) {
  console.error(
    "usage: node check_layout.js <html-file> [N|all]"
  );
  process.exit(1);
}

const FILE = path.resolve(input);

if (!fs.existsSync(FILE)) {
  console.error(`error: file not found: ${FILE}`);
  process.exit(1);
}

if (!fs.existsSync(CHROME)) {
  console.error(`error: Chrome not found: ${CHROME}`);
  process.exit(1);
}

const originalHTML = fs.readFileSync(FILE, "utf8");

const slideMatches =
  originalHTML.match(
    /<section\s+class=["'][^"']*\bslide\b[^"']*["']/gi
  ) || [];

const totalSlides = slideMatches.length;

if (totalSlides < 1) {
  console.error("error: no slides found");
  process.exit(1);
}

let slidesToCheck = [];

if (countArg === "all") {
  slidesToCheck = Array.from(
    { length: totalSlides },
    (_, i) => i + 1
  );
} else {
  const n = Number(countArg);

  if (
    !Number.isInteger(n) ||
    n < 1 ||
    n > totalSlides
  ) {
    console.error(
      `error: invalid slide number ${countArg}; deck has ${totalSlides} slides`
    );
    process.exit(1);
  }

  slidesToCheck = [n];
}

/*
 * Browser-side audit script.
 *
 * It is injected into a temporary copy placed beside the original
 * HTML so all relative assets keep resolving correctly.
 */
const auditScript = String.raw`
<script id="wanghong-layout-audit-script">
(() => {

  const PARAMS = new URLSearchParams(location.search);
  const PAGE = Number(PARAMS.get("preview") || "1");

  const TOLERANCE = 3;
  const COLLISION_MIN_W = 6;
  const COLLISION_MIN_H = 6;
  const COLLISION_MIN_AREA = 60;

  function rectObject(rect) {
    return {
      left: Number(rect.left.toFixed(2)),
      top: Number(rect.top.toFixed(2)),
      right: Number(rect.right.toFixed(2)),
      bottom: Number(rect.bottom.toFixed(2)),
      width: Number(rect.width.toFixed(2)),
      height: Number(rect.height.toFixed(2))
    };
  }

  function cleanText(el) {
    const text = (el.innerText || el.textContent || "")
      .replace(/\s+/g, " ")
      .trim();

    return text.slice(0, 72);
  }

  function elementLabel(el) {
    if (!el) return "<unknown>";

    let label = el.tagName.toLowerCase();

    if (el.id) {
      label += "#" + el.id;
    }

    if (el.classList && el.classList.length) {
      label += "." +
        [...el.classList]
          .slice(0, 4)
          .join(".");
    }

    const text = cleanText(el);

    if (text) {
      label += ' "' + text + '"';
    }

    return label;
  }

  function isVisible(el) {
    if (!el || !el.isConnected) return false;

    const style = getComputedStyle(el);

    if (
      style.display === "none" ||
      style.visibility === "hidden" ||
      Number(style.opacity) === 0
    ) {
      return false;
    }

    const rect = el.getBoundingClientRect();

    return (
      rect.width > 1 &&
      rect.height > 1
    );
  }

  function isNotes(el) {
    return Boolean(
      el.closest(
        ".notes, aside.notes, .speaker-notes, .notes-overlay"
      )
    );
  }

  function isAncestorPair(a, b) {
    return a.contains(b) || b.contains(a);
  }

  function ignoresAudit(el) {
    return Boolean(
      el.closest("[data-layout-audit-ignore]")
    );
  }

  function allowsOverlap(a, b) {
    return Boolean(
      a.closest("[data-layout-overlap-ok]") ||
      b.closest("[data-layout-overlap-ok]")
    );
  }

  function sameAnnotationOwner(a, b) {
    return Boolean(
      a.dataset.layoutAuditOwner &&
      a.dataset.layoutAuditOwner ===
        b.dataset.layoutAuditOwner
    );
  }

  function copyComputedStyle(source, target) {
    for (const property of source) {
      target.style.setProperty(
        property,
        source.getPropertyValue(property),
        source.getPropertyPriority(property)
      );
    }
  }

  /*
   * Annotation labels and arrows live in ::after / ::before. Browsers do
   * not expose DOMRect objects for pseudo-elements, so materialize invisible
   * audit probes with the exact computed pseudo styles. The probes are
   * absolutely positioned and therefore do not change document flow.
   */
  function materializeAnnotationProbes(slide) {
    const probes = [];

    for (const target of slide.querySelectorAll(".ann[data-note]")) {
      if (!target.dataset.note || ignoresAudit(target)) continue;

      for (const pseudo of ["::before", "::after"]) {
        const pseudoStyle = getComputedStyle(target, pseudo);

        if (
          pseudoStyle.display === "none" ||
          pseudoStyle.visibility === "hidden" ||
          pseudoStyle.content === "none"
        ) {
          continue;
        }

        const probe = document.createElement("span");
        probe.setAttribute("aria-hidden", "true");
        probe.dataset.layoutAuditProbe = pseudo.slice(2);
        probe.dataset.layoutAuditOwner = elementLabel(target);

        copyComputedStyle(pseudoStyle, probe);
        probe.style.setProperty("content", "none", "important");
        probe.style.setProperty("pointer-events", "none", "important");
        probe.style.setProperty("opacity", "0", "important");

        if (pseudo === "::after") {
          probe.textContent = target.dataset.note;
        }

        target.appendChild(probe);
        probes.push(probe);
      }
    }

    return probes;
  }

  function overlap(a, b) {

    const left = Math.max(a.left, b.left);
    const top = Math.max(a.top, b.top);
    const right = Math.min(a.right, b.right);
    const bottom = Math.min(a.bottom, b.bottom);

    const width = right - left;
    const height = bottom - top;

    return {
      width,
      height,
      area:
        width > 0 && height > 0
          ? width * height
          : 0
    };
  }

  function waitForAnimationFrames(count, timeoutMs) {
    const frames = new Promise(resolve => {
      function next(remaining) {
        if (remaining <= 0) {
          resolve();
          return;
        }

        requestAnimationFrame(() =>
          next(remaining - 1)
        );
      }

      next(count);
    });

    return Promise.race([
      frames,
      new Promise(resolve =>
        setTimeout(resolve, timeoutMs)
      )
    ]);
  }

  function addResultNode(report) {

    const old = document.getElementById(
      "wanghong-layout-audit-result"
    );

    if (old) old.remove();

    const script = document.createElement("script");

    script.id = "wanghong-layout-audit-result";
    script.type = "application/json";

    script.textContent = JSON.stringify(report);

    document.body.appendChild(script);

    document.documentElement.setAttribute(
      "data-layout-audit-ready",
      "yes"
    );
  }

  async function runAudit() {

    try {

      /*
       * Fonts can change formula dimensions substantially,
       * therefore never audit before fonts finish loading.
       */
      if (document.fonts && document.fonts.ready) {
        await Promise.race([
          document.fonts.ready,
          new Promise(resolve =>
            setTimeout(resolve, 3000)
          )
        ]);
      }

      /*
       * Allow KaTeX auto-render and other async layout work to settle
       * before waiting for two final animation frames.
       */
      await new Promise(resolve =>
        setTimeout(resolve, 250)
      );

      await waitForAnimationFrames(2, 1000);

      const slides = [
        ...document.querySelectorAll(".slide")
      ];

      const slide = slides[PAGE - 1];

      if (!slide) {

        addResultNode({
          page: PAGE,
          fatal: true,
          error: "slide not found",
          collisions: [],
          overflows: []
        });

        return;
      }

      /*
       * Extra safety:
       * do not depend solely on runtime preview implementation.
       */
      slides.forEach((s, index) => {

        if (index === PAGE - 1) {
          s.style.display = "";
          s.style.opacity = "1";
          s.style.transform = "none";
          s.classList.add("is-active");
        } else {
          s.style.display = "none";
          s.classList.remove("is-active");
        }

      });

      /*
       * Disable motion before measuring.
       */
      const staticStyle =
        document.createElement("style");

      staticStyle.textContent = [
        "*, *::before, *::after {",
        "  animation: none !important;",
        "  transition: none !important;",
        "}"
      ].join("\\n");

      document.head.appendChild(staticStyle);

      await waitForAnimationFrames(1, 1000);

      const slideRect =
        slide.getBoundingClientRect();

      const annotationProbes =
        materializeAnnotationProbes(slide);

      /*
       * Keep this list focused on meaningful layout blocks.
       *
       * Nested parent/child pairs are ignored later, so:
       * formula wrapper vs its own KaTeX child
       * is NOT falsely reported.
       */
      const selector = [
        ".slide-title",
        "h1",
        "h2",
        "h3",

        "p",
        "ul",
        "ol",
        "li",

        ".notes-list > div",

        ".formula-block",
        ".formula-hero",
        ".formula-summary",
        ".equation-chain > div",

        ".katex-display",
        "mjx-container[display='true']",

        ".result-box",
        ".safe-result",

        ".theorem-label",
        ".theorem-statement",
        ".theorem-interpretation",

        ".proof-step",

        ".math-panel",

        ".flow-box",

        "table",
        "svg",
        "pre",

        ".ann",
        "[data-note]"
      ].join(",");

      let elements = [
        ...slide.querySelectorAll(selector)
      ];

      elements = elements.filter(
        el =>
          isVisible(el) &&
          !isNotes(el) &&
          !ignoresAudit(el)
      );

      elements.push(...annotationProbes);

      /*
       * De-duplicate elements matched by multiple selectors.
       */
      elements = [...new Set(elements)];

      const collisions = [];
      const overflows = [];

      /*
       * -------------------------------------------------------
       * Slide-boundary overflow
       * -------------------------------------------------------
       */

      for (const el of elements) {

        const r = el.getBoundingClientRect();

        const problems = [];

        if (r.left < slideRect.left - TOLERANCE) {
          problems.push({
            side: "left",
            pixels:
              slideRect.left - r.left
          });
        }

        if (r.right > slideRect.right + TOLERANCE) {
          problems.push({
            side: "right",
            pixels:
              r.right - slideRect.right
          });
        }

        if (r.top < slideRect.top - TOLERANCE) {
          problems.push({
            side: "top",
            pixels:
              slideRect.top - r.top
          });
        }

        if (r.bottom > slideRect.bottom + TOLERANCE) {
          problems.push({
            side: "bottom",
            pixels:
              r.bottom - slideRect.bottom
          });
        }

        if (problems.length) {

          overflows.push({
            element: elementLabel(el),
            rect: rectObject(r),
            problems: problems.map(x => ({
              side: x.side,
              pixels: Number(
                x.pixels.toFixed(2)
              )
            }))
          });

        }

      }

      /*
       * -------------------------------------------------------
       * Pairwise collision audit
       * -------------------------------------------------------
       */

      for (let i = 0; i < elements.length; i++) {

        const a = elements[i];

        for (
          let j = i + 1;
          j < elements.length;
          j++
        ) {

          const b = elements[j];

          /*
           * Nested content is expected:
           *
           * .formula-block
           *    └── .katex-display
           *
           * table
           *    └── text
           *
           * Do not report these.
           */
          if (isAncestorPair(a, b)) {
            continue;
          }

          if (allowsOverlap(a, b)) {
            continue;
          }

          if (sameAnnotationOwner(a, b)) {
            continue;
          }

          /*
           * Elements sharing exactly the same text-flow parent
           * can legally touch on the same line.
           *
           * Inline annotation targets are handled visually later.
           */
          const aStyle = getComputedStyle(a);
          const bStyle = getComputedStyle(b);

          if (
            aStyle.display === "inline" &&
            bStyle.display === "inline" &&
            a.parentElement === b.parentElement
          ) {
            continue;
          }

          const ra = a.getBoundingClientRect();
          const rb = b.getBoundingClientRect();

          const o = overlap(ra, rb);

          if (
            o.width >= COLLISION_MIN_W &&
            o.height >= COLLISION_MIN_H &&
            o.area >= COLLISION_MIN_AREA
          ) {

            collisions.push({
              a: elementLabel(a),
              b: elementLabel(b),

              overlap: {
                width:
                  Number(o.width.toFixed(2)),
                height:
                  Number(o.height.toFixed(2)),
                area:
                  Number(o.area.toFixed(2))
              },

              rectA: rectObject(ra),
              rectB: rectObject(rb)
            });

          }

        }

      }

      /*
       * -------------------------------------------------------
       * Element internal overflow
       *
       * Useful for tables/pre blocks/formula wrappers whose
       * contents exceed their own box.
       * -------------------------------------------------------
       */

      const internalOverflows = [];

      const internalCandidates =
        elements.filter(el =>
          el.matches(
            "table, pre, .formula-block, .formula-hero, .math-panel"
          )
        );

      for (const el of internalCandidates) {

        if (
          el.scrollWidth >
            el.clientWidth + TOLERANCE ||
          el.scrollHeight >
            el.clientHeight + TOLERANCE
        ) {

          internalOverflows.push({
            element: elementLabel(el),

            client: {
              width: el.clientWidth,
              height: el.clientHeight
            },

            scroll: {
              width: el.scrollWidth,
              height: el.scrollHeight
            }
          });

        }

      }

      addResultNode({
        page: PAGE,
        title:
          slide.getAttribute("data-title") || "",
        fatal: false,

        slideRect:
          rectObject(slideRect),

        elementCount:
          elements.length,

        collisions,
        overflows,
        internalOverflows
      });

    } catch (error) {

      addResultNode({
        page: PAGE,
        fatal: true,
        error:
          String(
            error && error.stack
              ? error.stack
              : error
          ),
        collisions: [],
        overflows: [],
        internalOverflows: []
      });

    }

  }

  if (
    document.readyState === "complete" ||
    document.readyState === "interactive"
  ) {
    setTimeout(runAudit, 0);
  } else {
    addEventListener(
      "DOMContentLoaded",
      runAudit,
      { once: true }
    );
  }

})();
</script>
`;

let injectedHTML;

if (originalHTML.includes("</body>")) {
  injectedHTML = originalHTML.replace(
    "</body>",
    auditScript + "\n</body>"
  );
} else {
  injectedHTML =
    originalHTML + "\n" + auditScript;
}

/*
 * Keep the audit copy outside the source tree. If the deck does not already
 * define a base URL, add one so relative CSS/JS/assets still resolve from the
 * source HTML directory.
 */
const auditDir = fs.mkdtempSync(
  path.join(os.tmpdir(), "wanghong-layout-audit-")
);
const auditFile = path.join(auditDir, "deck.html");

if (
  !/<base\s/i.test(injectedHTML) &&
  /<head(?:\s[^>]*)?>/i.test(injectedHTML)
) {
  const sourceBase =
    pathToFileURL(path.dirname(FILE) + path.sep).href;

  injectedHTML = injectedHTML.replace(
    /(<head(?:\s[^>]*)?>)/i,
    `$1\n<base href="${sourceBase}">`
  );
}

fs.writeFileSync(
  auditFile,
  injectedHTML,
  "utf8"
);

const realLayoutFailures = [];
const infrastructureFailures = [];
const AUDIT_BUDGETS = [5000, 12000, 20000];

function extractJSON(dom) {

  const match = dom.match(
    /<script\b[^>]*\bid=["']wanghong-layout-audit-result["'][^>]*>([\s\S]*?)<\/script>/i
  );

  if (!match) {
    return {
      ok: false,
      kind: "not-ready",
      message: "audit result not ready"
    };
  }

  try {
    return {
      ok: true,
      report: JSON.parse(match[1])
    };
  } catch (error) {
    return {
      ok: false,
      kind: "json-extraction",
      message:
        "audit JSON extraction failure: " +
        error.message
    };
  }
}

function logRetry(page, reason, nextAttemptIndex) {
  const nextBudget =
    AUDIT_BUDGETS[nextAttemptIndex];

  console.error(
    `slide ${page}: ${reason.message}; ` +
    `retry ${nextAttemptIndex + 1}/${AUDIT_BUDGETS.length} ` +
    `with ${nextBudget}ms`
  );
}

try {

  console.log("");
  console.log(
    `layout audit: ${slidesToCheck.length} slide(s)`
  );
  console.log("");

  for (const page of slidesToCheck) {

    const url =
      pathToFileURL(auditFile).href +
      `?preview=${page}&layoutAudit=1`;

    let report;
    let lastInfrastructureReason;

    for (
      let attemptIndex = 0;
      attemptIndex < AUDIT_BUDGETS.length;
      attemptIndex++
    ) {
      const budget = AUDIT_BUDGETS[attemptIndex];
      let dom;

      try {
        dom = execFileSync(
          CHROME,
          [
            "--headless=new",
            "--allow-file-access-from-files",
            "--disable-gpu",
            "--hide-scrollbars",
            "--no-sandbox",
            "--force-device-scale-factor=1",
            "--run-all-compositor-stages-before-draw",
            "--disable-background-timer-throttling",
            "--disable-renderer-backgrounding",
            "--window-size=1920,1080",
            `--virtual-time-budget=${budget}`,
            "--dump-dom",
            url
          ],
          {
            encoding: "utf8",
            maxBuffer: 64 * 1024 * 1024,
            stdio: [
              "ignore",
              "pipe",
              "ignore"
            ]
          }
        );
      } catch (error) {
        lastInfrastructureReason = {
          kind: "chrome-dump-dom",
          message: "Chrome dump-dom failure"
        };

        if (attemptIndex + 1 < AUDIT_BUDGETS.length) {
          logRetry(
            page,
            lastInfrastructureReason,
            attemptIndex + 1
          );
        }

        continue;
      }

      const extracted = extractJSON(dom);

      if (!extracted.ok) {
        lastInfrastructureReason = extracted;

        if (attemptIndex + 1 < AUDIT_BUDGETS.length) {
          logRetry(
            page,
            lastInfrastructureReason,
            attemptIndex + 1
          );
        }

        continue;
      }

      if (extracted.report.fatal) {
        lastInfrastructureReason = {
          kind: "browser-audit-fatal",
          message:
            "browser audit fatal error: " +
            (extracted.report.error || "unknown error")
        };

        if (attemptIndex + 1 < AUDIT_BUDGETS.length) {
          logRetry(
            page,
            lastInfrastructureReason,
            attemptIndex + 1
          );
        }

        continue;
      }

      report = extracted.report;
      break;
    }

    if (!report) {
      console.error(
        `❌ slide ${page}: AUDIT INFRASTRUCTURE FAILURE`
      );
      console.error(
        `   ${
          lastInfrastructureReason?.message ||
          "audit result unavailable"
        }`
      );

      infrastructureFailures.push({
        page,
        reason: lastInfrastructureReason
      });

      continue;
    }

    const issueCount =
      (report.collisions || []).length +
      (report.overflows || []).length +
      (report.internalOverflows || []).length;

    if (issueCount === 0) {

      console.log(
        `✅ slide ${page}` +
        (
          report.title
            ? ` — ${report.title}`
            : ""
        )
      );

      continue;
    }

    console.log("");
    console.error(
      `❌ slide ${page}` +
      (
        report.title
          ? ` — ${report.title}`
          : ""
      )
    );

    console.error(
      "   REAL LAYOUT FAILURE"
    );

    for (
      const item of report.overflows || []
    ) {

      const details =
        item.problems
          .map(
            p =>
              `${p.side} ${p.pixels}px`
          )
          .join(", ");

      console.error(
        `   OVERFLOW: ${item.element}`
      );

      console.error(
        `             ${details}`
      );
    }

    for (
      const item of
        report.internalOverflows || []
    ) {

      console.error(
        `   INTERNAL OVERFLOW: ${item.element}`
      );

      console.error(
        `      client ${item.client.width}x${item.client.height}` +
        ` → scroll ${item.scroll.width}x${item.scroll.height}`
      );
    }

    for (
      const item of report.collisions || []
    ) {

      console.error(
        "   COLLISION:"
      );

      console.error(
        `      A: ${item.a}`
      );

      console.error(
        `      B: ${item.b}`
      );

      console.error(
        `      overlap: ` +
        `${item.overlap.width}px × ` +
        `${item.overlap.height}px`
      );
    }

    realLayoutFailures.push(report);
  }

} finally {

  try {
    fs.rmSync(auditDir, {
      recursive: true,
      force: true
    });
  } catch (_) {
    // ignore cleanup errors
  }

}

console.log("");

if (
  realLayoutFailures.length ||
  infrastructureFailures.length
) {

  console.error(
    "=========================================="
  );

  if (realLayoutFailures.length) {
    console.error(
      "REAL LAYOUT FAILURE: " +
      `${realLayoutFailures.length} slide(s)`
    );
  }

  if (infrastructureFailures.length) {
    console.error(
      "AUDIT INFRASTRUCTURE FAILURE: " +
      `${infrastructureFailures.length} slide(s)`
    );
  }

  console.error(
    "=========================================="
  );

  if (infrastructureFailures.length) {
    process.exit(3);
  }

  process.exit(2);
}

console.log(
  "=========================================="
);

console.log(
  "LAYOUT AUDIT PASSED"
);

console.log(
  "=========================================="
);

process.exit(0);
