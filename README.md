# dsh-wanghong-handwritten-ppt

[简体中文](README.zh-CN.md)

A packaged DeepSeek Harness skill for creating 16:9 Notability-style academic handwritten HTML slide decks and exporting every slide as a 1920×1080 PNG

![Cover preview](skills/wanghong-handwritten-ppt/assets/preview-cover.png)

![Diagram preview](skills/wanghong-handwritten-ppt/assets/preview-diagram.png)

## Install

```sh
dsh plugin --profile web add github:tjxj/dsh-wanghong-handwritten-ppt
```

Restart `dsh web`, then ask for a Wang Hong-inspired handwritten PPT or invoke `/wanghong-handwritten-ppt`

The bundle registers one packaged skill and exposes its templates, styles, scripts, examples, prompts, and preview assets through the DSH skill resource base

## Requirements

- Node.js `^22.19.0` or `>=24.0.0`
- Google Chrome for PNG export
- The macOS HanziPen SC font downloaded through Font Book

## Verify

```sh
npm test
npm run pack:check
```

`render.sh` isolates each slide with `?preview=N`, disables animation and transitions, and runs the DOM collision audit before taking screenshots. Significant overlaps or slide-boundary overflow in body text, formulas, annotations, result boxes, tables, or SVGs stop the export.

Run the audit directly when you only need diagnostics:

```sh
node skills/wanghong-handwritten-ppt/scripts/check_layout.js /absolute/path/to/index.html all
```

## Discovery

This public repository carries the `dsh-plugin` GitHub topic and declares an installable `dsh.bundle` in `package.json`

## License

MIT. Third-party assets keep their license notices in the skill's `assets/` directory
