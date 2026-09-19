# 王虹手写 PPT：数学手写、强调特效与手绘区使用手册

这份手册用于 `dsh-wanghong-handwritten-ppt`。建议把“数学手写化”和“视觉特效”分开管理。

## 1. 文件放在哪里

插件源码：

```text
skills/wanghong-handwritten-ppt/assets/
├── handwritten-math-full.css
├── handwritten-math-full.js
└── handwritten-effects.css
```

当前生成的 PPT：

```text
abelian-kuranishi-handwritten-ppt/
├── index.html
└── assets/
    ├── handwritten-math-full.css
    ├── handwritten-math-full.js
    └── handwritten-effects.css
```

在 `index.html` 的 `<head>` 里加载：

```html
<link rel="stylesheet" href="assets/handwritten-math-full.css">
<link rel="stylesheet" href="assets/handwritten-effects.css">
```

在 `runtime.js` 后加载：

```html
<script src="assets/runtime.js"></script>
<script src="assets/handwritten-math-full.js"></script>
```

如果只想改当前这套 PPT，就只编辑当前 deck 的 `index.html` 和 `assets/handwritten-effects.css`。

如果想让以后所有生成的 PPT 默认拥有这些特效，就把 `handwritten-effects.css` 放到插件的 `assets/`，并在：

```text
skills/wanghong-handwritten-ppt/templates/deck.html
```

中默认加载它；同时把使用规则写进：

```text
skills/wanghong-handwritten-ppt/SKILL.md
```

---

## 2. 使用原则

手写感不是“特效越多越好”。建议每页：

- 荧光笔 1–2 处
- 波浪线 / 手绘下划线 0–2 处
- 主强调框最多 1 个
- 手绘箭头 1–3 个
- 红色只用于 obstruction / warning / contradiction
- 绿色用于 sufficiency / solved / existence
- 淡蓝用于 definition / structure
- 黄色荧光用于最重要的结论

---

## 3. 荧光笔

### 黄色

最重要 theorem / criterion：

```html
<span class="hl-yellow">smoothness criterion</span>
```

整块公式：

```html
<div class="math-hl-yellow">
  $$\operatorname{Kur}(J_M)\text{ smooth}\Longleftrightarrow\cdots$$
</div>
```

### 绿色

sufficiency / analytic / invertible：

```html
<span class="hl-green">analytic solution</span>
```

### 粉色

exception / delicate hypothesis：

```html
<span class="hl-pink">exceptional branch</span>
```

### 淡蓝

definition / notation / first-order data：

```html
<span class="hl-blue">First-order data</span>
```

---

## 4. 波浪线和手绘下划线

蓝色波浪线：

```html
<span class="hand-wave">μ-symmetry lemma</span>
```

红色波浪线：

```html
<span class="hand-wave-red">terminal obstruction</span>
```

绿色波浪线：

```html
<span class="hand-wave-green">no residual</span>
```

手绘直下划线：

```html
<span class="hand-underline">Set</span>
```

双重手绘下划线：

```html
<span class="hand-double-underline">key equivalence</span>
```

---

## 5. 手绘框

红框：

```html
<div class="rough-box-red">
  No terminal cokernel residual occurs.
</div>
```

蓝框：

```html
<div class="rough-box-blue">
  $$H^1\cong\cdots$$
</div>
```

绿框：

```html
<div class="rough-box-green">
  $A_s$ is analytic in $s$.
</div>
```

草稿虚线框：

```html
<div class="sketch-box">
  geometric picture here
</div>
```

---

## 6. 便利贴、批注、胶带

黄色便利贴：

```html
<div class="sticky-note">
  Key idea: use the two selected H¹ directions.
</div>
```

边栏批注：

```html
<span class="margin-note">remember this!</span>
```

胶带卡片：

```html
<div class="taped-note">
  finite root chain
</div>
```

---

## 7. 手绘箭头

简单箭头：

```html
A <span class="scribble-arrow">→</span> B
```

长箭头：

```html
<div class="hand-arrow-line"></div>
```

弯箭头建议放在 SVG 里：

```html
<svg class="sketch-svg" viewBox="0 0 600 300">
  <path class="sketch-path"
        d="M80 220 C180 80, 360 80, 500 190" />
  <path class="sketch-path"
        d="M500 190 l-28 -4 M500 190 l-13 -26" />
</svg>
```

---

## 8. 圈重点

蓝圈：

```html
<span class="hand-circle">invertible</span>
```

红圈：

```html
<span class="hand-circle-red">obstruction</span>
```

---

## 9. 删除线 / 改稿感

```html
<span class="hand-strike">naive route</span>
<span class="scribble-arrow">→</span>
<span class="hl-green">new formulation</span>
```

---

## 10. 手绘图片区

以后要手绘几何图、流程图、矩阵 pencil、moduli branch、flow cartoon，统一用 `sketch-space`。

普通画布：

```html
<div class="sketch-space">
  <div class="sketch-space-title">Geometric picture</div>

  <svg class="sketch-svg" viewBox="0 0 800 420">
    <circle class="sketch-shape" cx="180" cy="210" r="75" />
    <circle class="sketch-shape" cx="590" cy="210" r="75" />

    <path class="sketch-path"
          d="M270 210 C360 170, 430 170, 500 210" />

    <text class="sketch-label" x="145" y="215">H¹</text>
    <text class="sketch-label" x="550" y="215">MC</text>
  </svg>
</div>
```

方格纸：

```html
<div class="sketch-space sketch-grid">
  <div class="sketch-space-title">Scratch picture</div>
</div>
```

点阵纸：

```html
<div class="sketch-space sketch-dots">
  <div class="sketch-space-title">Local model</div>
</div>
```

只预留位置：

```html
<div class="sketch-placeholder">
  HAND-DRAW FIGURE HERE
</div>
```

以后把里面替换成 `<svg>` 即可。

---

## 11. 手绘 SVG 标准 class

```text
sketch-path          蓝色手绘曲线 / 箭头
sketch-path-red      红色
sketch-path-green    绿色
sketch-shape         手绘圆 / 矩形 / 轮廓
sketch-label         图中手写标签
sketch-caption       图下注释
```

例子：

```html
<svg class="sketch-svg" viewBox="0 0 800 420">
  <path class="sketch-path"
        d="M100 200 C220 110, 360 120, 470 200" />

  <circle class="sketch-shape"
          cx="100" cy="200" r="40" />

  <text class="sketch-label"
        x="80" y="210">A</text>
</svg>
```

---

## 12. 大括号旁注

```html
<div class="hand-brace-group">
  <div>
    line one<br>
    line two<br>
    line three
  </div>
  <div class="hand-brace-note">same mechanism</div>
</div>
```

---

## 13. 组合强调

```html
<div class="annotated-result">
  <span class="hand-circle">$T_s$ invertible</span>
  <span class="scribble-arrow">→</span>
  <span class="hl-green">$v=0$</span>
</div>
```

---

## 14. 推荐每种页面怎么用

### Theorem 页

```html
<div class="eq math-hl-yellow">
  $$\boxed{\text{main theorem}}$$
</div>
```

### Proof spine 页

```html
<span class="hand-wave">1. Necessity</span>
<span class="hl-green">2. Sufficiency</span>
```

### Obstruction 页

```html
<div class="rough-box-red">
  terminal obstruction survives
</div>
```

### Definition 页

```html
<span class="hl-blue">Definition</span>
```

### Geometric picture 页

```html
<div class="sketch-space sketch-dots">
  <svg class="sketch-svg" viewBox="0 0 800 420">
    ...
  </svg>
</div>
```

---

## 15. 推荐颜色语义

| 视觉 | 用途 |
|---|---|
| 深蓝墨水 | 普通正文、公式 |
| 淡蓝 | definition / structure |
| 黄色荧光 | 最重要结论 |
| 绿色 | success / sufficiency / solved |
| 红色 | obstruction / warning |
| 粉色 | delicate / exceptional branch |

---

## 16. 不要这样做

不要：

- 一页 5 个荧光笔
- 一页 4 个红框
- 所有标题都波浪线
- 所有公式随机旋转
- 每个符号随机上下跳动

真实手写感来自：

```text
字体
+ 少量不规则
+ 清楚的层级
+ 合理空白
+ 有目的的批注
```

---

## 17. 推荐工作流

```text
1. 先排版
2. layout audit
3. 数学公式手写化
4. 再 layout audit
5. 最后加荧光笔 / 框 / 波浪线
6. 加手绘图
7. visual QA
8. 导出 PNG / PDF
```

特效永远最后加，避免把排版问题和装饰问题混在一起。
