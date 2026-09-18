#!/usr/bin/env bash
set -euo pipefail

# ============================================================
# WangHong Handwritten PPT — deterministic PNG renderer
#
# Usage:
#   render.sh <html-file> [N|all] [out-dir] [font-file]
#
# Main guarantees:
#   1. Render every slide via ?preview=N, NOT #/N
#   2. Non-current slides are display:none via runtime preview mode
#   3. Disable transition / animation during export
#   4. Verify HanziPen SC is actually loaded
#   5. Force 1920x1080 output
#   6. Verify generated PNG dimensions
#   7. Generate contact-sheet.png automatically
#   8. Fail before export when the DOM layout audit finds collisions
# ============================================================

CHROME="${CHROME:-/Applications/Google Chrome.app/Contents/MacOS/Google Chrome}"

FILE="${1:-}"
COUNT="${2:-all}"
OUT="${3:-}"
FONT_FILE="${4:-${WANGHONG_FONT_PATH:-}}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# ------------------------------------------------------------
# Basic checks
# ------------------------------------------------------------

if [[ -z "$FILE" || ! -f "$FILE" ]]; then
  echo "usage: render.sh <html-file> [N|all] [out-dir] [font-file]" >&2
  exit 1
fi

if [[ ! -x "$CHROME" ]]; then
  echo "error: Google Chrome not found:" >&2
  echo "  $CHROME" >&2
  exit 1
fi

if ! command -v python3 >/dev/null 2>&1; then
  echo "error: python3 not found on PATH" >&2
  exit 1
fi

if ! command -v node >/dev/null 2>&1; then
  echo "error: node not found on PATH" >&2
  exit 1
fi

# ------------------------------------------------------------
# Locate HanziPen SC font
# ------------------------------------------------------------

if [[ -z "$FONT_FILE" ]]; then
  for candidate in \
    "$HOME/Library/Fonts/Hanzipen.ttc" \
    "$HOME/Library/Fonts/HanziPen.ttc" \
    "/Library/Fonts/Hanzipen.ttc" \
    "/Library/Fonts/HanziPen.ttc" \
    "/System/Library/Fonts/Supplemental/Hanzipen.ttc" \
    "/System/Library/Fonts/Supplemental/HanziPen.ttc"; do

    if [[ -f "$candidate" ]]; then
      FONT_FILE="$candidate"
      break
    fi
  done
fi

if [[ -z "$FONT_FILE" && -d "/System/Library/AssetsV2" ]]; then
  FONT_FILE=$(
    find /System/Library/AssetsV2 \
      \( \
        -path '*/com_apple_MobileAsset_Font7/*/AssetData/Hanzipen.ttc' \
        -o \
        -path '*/com_apple_MobileAsset_Font8/*/AssetData/Hanzipen.ttc' \
      \) \
      -type f \
      -print \
      -quit \
      2>/dev/null || true
  )
fi

if [[ -z "$FONT_FILE" || ! -f "$FONT_FILE" ]]; then
  echo "error: 找不到 HanziPen SC / 翩翩体-简 字体文件" >&2
  echo "download: 在 macOS 字体册中下载“翩翩体-简”" >&2
  echo "" >&2
  echo "也可以显式指定：" >&2
  echo "  render.sh deck.html all png /path/to/Hanzipen.ttc" >&2
  exit 1
fi

echo "font: $FONT_FILE"

# ------------------------------------------------------------
# Resolve slide count
# ------------------------------------------------------------

STEM="$(basename "${FILE%.*}")"

if [[ "$COUNT" == "all" ]]; then
  COUNT=$(
    python3 - "$FILE" <<'PY'
import re
import sys
from pathlib import Path

path = Path(sys.argv[1])
html = path.read_text(encoding="utf-8")

slides = re.findall(
    r'<section\s+class="[^"]*\bslide\b',
    html,
    flags=re.I
)

print(len(slides))
PY
  )
fi

if ! [[ "$COUNT" =~ ^[0-9]+$ ]]; then
  echo "error: slide count must be an integer or 'all'" >&2
  exit 1
fi

if [[ "$COUNT" -lt 1 ]]; then
  echo "error: no slides found" >&2
  exit 1
fi

echo "slides: $COUNT"

# ------------------------------------------------------------
# Output directory
# ------------------------------------------------------------

if [[ -z "$OUT" ]]; then
  OUT="$(dirname "$FILE")/${STEM}-png"
fi

mkdir -p "$OUT"

OUT=$(
  python3 - "$OUT" <<'PY'
import sys
from pathlib import Path
print(Path(sys.argv[1]).resolve())
PY
)

echo "output: $OUT"

# ------------------------------------------------------------
# Temporary render environment
# ------------------------------------------------------------

RENDER_DIR="$(mktemp -d "/tmp/wanghong-ppt-render.XXXXXX")"
RENDER_HTML="$RENDER_DIR/deck.html"

cleanup() {
  rm -rf "$RENDER_DIR"
}

trap cleanup EXIT INT TERM

# prepare_render_html.py already injects / verifies the requested font
python3 \
  "$SCRIPT_DIR/prepare_render_html.py" \
  "$FILE" \
  "$FONT_FILE" \
  "$RENDER_HTML"

# ------------------------------------------------------------
# Inject deterministic static-export CSS
# ------------------------------------------------------------

python3 - "$RENDER_HTML" <<'PY'
import sys
from pathlib import Path

path = Path(sys.argv[1])
html = path.read_text(encoding="utf-8")

STYLE = r"""
<style id="wanghong-static-export">

/*
 * Static PNG export mode.
 * Never capture animation / transition intermediate frames.
 */

*, *::before, *::after {
  animation: none !important;
  animation-name: none !important;
  animation-duration: 0s !important;
  animation-delay: 0s !important;

  transition: none !important;
  transition-property: none !important;
  transition-duration: 0s !important;
  transition-delay: 0s !important;

  scroll-behavior: auto !important;
}

/*
 * Elements that normally enter through animations must already
 * be visible in the exported still frame.
 */
[data-anim],
[class*="anim-"] {
  opacity: 1 !important;
  transform: none !important;
  filter: none !important;
  clip-path: none !important;
}

/*
 * Path-draw animations sometimes leave a non-zero dash offset.
 */
[data-anim] svg *,
svg [data-anim] {
  stroke-dashoffset: 0 !important;
}

/*
 * Preview mode itself is handled by runtime.js.
 * This is an additional safety net.
 */
html[data-preview="1"] .slide:not(.is-active),
body[data-preview="1"] .slide:not(.is-active) {
  display: none !important;
}

html[data-preview="1"] .slide.is-active,
body[data-preview="1"] .slide.is-active {
  display: block !important;
  opacity: 1 !important;
  transform: none !important;
  pointer-events: auto !important;
}

/*
 * Never export presenter / speaker UI.
 */
html[data-preview="1"] .progress-bar,
html[data-preview="1"] .notes-overlay,
html[data-preview="1"] .overview,
html[data-preview="1"] .notes,
html[data-preview="1"] aside.notes,
html[data-preview="1"] .speaker-notes {
  display: none !important;
}

/*
 * Lock export canvas.
 */
html,
body {
  width: 1920px !important;
  height: 1080px !important;
  margin: 0 !important;
  padding: 0 !important;
  overflow: hidden !important;
}

</style>
"""

if 'id="wanghong-static-export"' not in html:
    if "</head>" in html:
        html = html.replace("</head>", STYLE + "\n</head>", 1)
    else:
        html = STYLE + "\n" + html

path.write_text(html, encoding="utf-8")
PY

RENDER_URL="file://$RENDER_HTML"

# ------------------------------------------------------------
# Stable Chrome settings
# ------------------------------------------------------------

CHROME_COMMON=(
  --headless=new
  --allow-file-access-from-files
  --disable-gpu
  --hide-scrollbars
  --no-sandbox
  --force-device-scale-factor=1
  --run-all-compositor-stages-before-draw
  --disable-background-timer-throttling
  --disable-backgrounding-occluded-windows
  --disable-renderer-backgrounding
)

# ------------------------------------------------------------
# Font preflight
#
# IMPORTANT:
# Use ?preview=1, not #/1.
# ------------------------------------------------------------

echo "checking HanziPen SC..."

if ! FONT_CHECK=$(
  "$CHROME" \
    "${CHROME_COMMON[@]}" \
    --virtual-time-budget=4000 \
    --dump-dom \
    "${RENDER_URL}?preview=1" \
  2>/dev/null
); then
  echo "error: Chrome 字体预检失败" >&2
  exit 1
fi

if [[ "$FONT_CHECK" != *'data-wanghong-font-ready="yes"'* ]]; then
  echo "error: HanziPen SC 字体加载失败" >&2
  echo "refusing to export with fallback font" >&2
  exit 1
fi

echo "font check: OK"

# ------------------------------------------------------------
# DOM layout gate
#
# Audit the exact temporary HTML used for export. It already contains
# the locked font and motion-free CSS, so measurements match screenshots.
# Any overflow or significant collision aborts the export.
# ------------------------------------------------------------

echo "checking DOM layout..."

node \
  "$SCRIPT_DIR/check_layout.js" \
  "$RENDER_HTML" \
  all

echo "layout check: OK"

# ------------------------------------------------------------
# Render slides
# ------------------------------------------------------------

echo ""
echo "rendering slides with preview-only mode..."

for i in $(seq 1 "$COUNT"); do

  NUM="$(printf '%02d' "$i")"
  TARGET="$OUT/${STEM}_${NUM}.png"

  echo "[$i/$COUNT] $TARGET"

  "$CHROME" \
    "${CHROME_COMMON[@]}" \
    --virtual-time-budget=4000 \
    --window-size=1920,1080 \
    "--screenshot=$TARGET" \
    "${RENDER_URL}?preview=${i}" \
    >/dev/null 2>&1

  if [[ ! -s "$TARGET" ]]; then
    echo "error: failed to render slide $i" >&2
    exit 1
  fi

  # ----------------------------------------------------------
  # Verify exact PNG dimensions using only Python stdlib
  # ----------------------------------------------------------

  python3 - "$TARGET" <<'PY'
import struct
import sys
from pathlib import Path

path = Path(sys.argv[1])

with path.open("rb") as f:
    data = f.read(24)

if len(data) < 24 or data[:8] != b"\x89PNG\r\n\x1a\n":
    raise SystemExit(f"error: not a valid PNG: {path}")

width, height = struct.unpack(">II", data[16:24])

if (width, height) != (1920, 1080):
    raise SystemExit(
        f"error: wrong PNG size for {path.name}: "
        f"{width}x{height}, expected 1920x1080"
    )
PY

done

# ------------------------------------------------------------
# Build contact sheet using Chrome itself
#
# No Pillow / ImageMagick dependency required.
# ------------------------------------------------------------

CONTACT_HTML="$RENDER_DIR/contact-sheet.html"
CONTACT_SHEET="$OUT/contact-sheet.png"

CONTACT_HEIGHT=$(
  python3 - \
    "$OUT" \
    "$STEM" \
    "$COUNT" \
    "$CONTACT_HTML" <<'PY'
import html
import math
import sys
from pathlib import Path

out_dir = Path(sys.argv[1]).resolve()
stem = sys.argv[2]
count = int(sys.argv[3])
contact_html = Path(sys.argv[4])

COLS = 4
CARD_W = 450
CARD_H = 282
GAP = 18
PAGE_PAD = 24

rows = math.ceil(count / COLS)

height = (
    PAGE_PAD * 2
    + rows * CARD_H
    + max(0, rows - 1) * GAP
)

cards = []

for i in range(1, count + 1):
    filename = f"{stem}_{i:02d}.png"
    path = out_dir / filename

    cards.append(
        f"""
        <figure class="card">
          <img src="{html.escape(path.as_uri())}" alt="slide {i}">
          <figcaption>
            <span class="num">{i:02d}</span>
            <span>{html.escape(filename)}</span>
          </figcaption>
        </figure>
        """
    )

doc = f"""<!doctype html>
<html>
<head>
<meta charset="utf-8">
<title>Contact Sheet</title>
<style>

* {{
  box-sizing: border-box;
}}

html,
body {{
  margin: 0;
  padding: 0;
  width: 1920px;
  min-height: {height}px;
  background: #e8e8e5;
  font-family:
    -apple-system,
    BlinkMacSystemFont,
    "Helvetica Neue",
    Arial,
    sans-serif;
}}

main {{
  width: 100%;
  padding: {PAGE_PAD}px;
  display: grid;
  grid-template-columns: repeat({COLS}, 1fr);
  gap: {GAP}px;
  align-items: start;
}}

.card {{
  margin: 0;
  padding: 9px;
  background: white;
  border: 1px solid rgba(0, 0, 0, .14);
  border-radius: 4px;
  overflow: hidden;
}}

.card img {{
  display: block;
  width: 100%;
  aspect-ratio: 16 / 9;
  object-fit: contain;
  background: white;
}}

figcaption {{
  height: 30px;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 2px 0;
  font-size: 13px;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}}

.num {{
  font-weight: 700;
  font-size: 14px;
  color: #183b56;
}}

</style>
</head>
<body>
<main>
{''.join(cards)}
</main>
</body>
</html>
"""

contact_html.write_text(doc, encoding="utf-8")

print(height)
PY
)

"$CHROME" \
  "${CHROME_COMMON[@]}" \
  --virtual-time-budget=3000 \
  "--window-size=1920,$CONTACT_HEIGHT" \
  "--screenshot=$CONTACT_SHEET" \
  "file://$CONTACT_HTML" \
  >/dev/null 2>&1

if [[ ! -s "$CONTACT_SHEET" ]]; then
  echo "error: failed to create contact sheet" >&2
  exit 1
fi

# ------------------------------------------------------------
# Finish
# ------------------------------------------------------------

echo ""
echo "=========================================="
echo "render complete"
echo "=========================================="
echo "slides:        $COUNT"
echo "PNG directory: $OUT"
echo "contact sheet: $CONTACT_SHEET"
echo ""
echo "IMPORTANT:"
echo "Open contact-sheet.png and visually inspect every page."
echo "Do not treat successful rendering as successful layout QA."
