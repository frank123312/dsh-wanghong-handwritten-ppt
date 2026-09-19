---
name: wanghong-handwritten-ppt
description: 将文章、讲稿或技术主题制作成王虹学术报告气质的 16:9 Notability 手写风 HTML 幻灯片，并逐页导出 PNG。触发词：王虹PPT风格、王虹手写PPT、Notability学术手写幻灯片、手写网页PPT、手写PPT、数学家手写报告风。
---

# 王虹学术手写风 HTML 幻灯片

把内容做成一套安静、工整、逻辑清楚、信息密度高的手写学术报告。

视觉上接近 Notability 数字手写页，内容上强调：

- 一页一个问题
- 连续推导
- 数学结构清楚
- 手写视觉统一
- 投影环境可读
- 不牺牲数学正确性换取装饰效果

当任务包含数学、理论计算、定理证明、矩阵、几何、PDE、代数、拓扑等内容时，优先使用“学术黑板 / 数字手写讲义”的视觉语言，而不是商业 PPT 风格。

---

## 适用场景

- 技术文章转演示文稿
- 论文、模型、工具或产品的原理讲解
- 数学论文、定理、证明和推导展示
- 需要 16:9 HTML 幻灯片和逐页 PNG 的任务
- 希望保留手写温度，同时要求中文和数学内容清楚可读的报告
- 已有 HTML deck 的 layout repair、字体统一与重新导出

---

## 先读材料

1. 读取用户提供的文章、讲稿、数据、论文、公式和参考图。

2. 需要复用完整视觉规范或提示词时，读取：

```text
references/style-guide.md
```

3. 需要查看成品结构时，打开：

```text
examples/deepseek-v4-flash/index.html
```

4. 需要快速开工时，从：

```text
templates/deck.html
```

复制一份新文件。

5. 如果用户要求修复已有 deck，必须优先读取并修改现有：

```text
index.html
```

不得为了方便重新生成一套内容完全不同的 deck。

---

# 全局硬约束

以下规则属于不可违反的交付条件。

## 内容约束

- 不得擅自修改 theorem。
- 不得擅自修改 definition。
- 不得擅自修改公式。
- 不得擅自修改 notation。
- 不得擅自改变 proof step。
- 不得擅自改变推导顺序。
- 不得改变数学结论。
- 不得为了版式简洁删除关键数学条件。
- 不得为了手写效果把数学表达改成不等价表达。

当用户要求 layout repair 时，只允许调整：

- grid
- gap
- margin
- padding
- line-height
- column width
- font-size
- annotation position
- block position
- section height
- page split

如果确实需要拆页，拆页前后必须保持原始数学顺序和论证逻辑不变。

---

## Layout 硬约束

任何交付版本均不得出现：

- 正文与正文重叠
- 正文与公式重叠
- 公式与公式重叠
- annotation 与正文重叠
- annotation 与公式重叠
- annotation 彼此严重重叠
- conclusion / result box 压住其他内容
- table 超出页面
- SVG 超出页面
- 公式超出页面
- 标题超出页面
- 两栏内容互相侵入
- 内容被 slide 边界裁切
- 上一页残影出现在下一页
- 动画中间态被错误截图

两栏布局必须保留清楚 gutter。

不要通过以下方式强行塞内容：

- 极端缩小字号
- 极端压缩 line-height
- 过度缩小公式
- 把大量证明塞进一个小框
- 把十几行内容缩成不可投影阅读的字体

当内容过密时，优先：

1. 重新安排 grid
2. 增大列间距
3. 调整信息层级
4. 删除非必要装饰
5. 拆成两页或更多页

数学报告宁可多一页，也不要出现无法阅读的一页。

---

# 完成标准

- 固定 16:9。
- 浏览器中无滚动条。
- 无内容溢出。
- 无明显元素碰撞。
- 封面保持极简。
- 封面下半页至少保留明显留白。
- 正文每页回答一个清楚的问题。
- 整套报告形成连续逻辑链。
- 字号、颜色和手绘线条统一。
- 中文投影可读。
- 数学公式投影可读。
- 重要数字和结论同时出现在正文。
- 手写 annotation 只承担视觉提示。
- 支持左右键翻页。
- 支持空格翻页。
- 支持全屏。
- 每页都有简短讲稿备注。
- 输出 HTML。
- 输出全部 PNG。
- 输出 contact sheet。
- 必须实际打开并检查导出结果。
- 第一次 render 后不得直接宣布完成。

只有经过完整 visual QA 后才算完成。

---

# 工作流程

## 1. 整理故事线

先从原文提取：

- 报告要回答的总问题
- 观众需要先知道的背景
- 3 到 6 个核心判断
- 支撑判断的数据
- 对比
- 流程
- 例子
- 定理
- 关键公式
- 证明骨架
- 最后希望观众记住的一句话

通常把内容拆成 12 到 24 页。

数学内容较密时可以超过 24 页。

推荐顺序：

```text
封面
→ 背景
→ 问题
→ 主要定理
→ notation
→ 关键结构
→ proof spine
→ technical steps
→ main consequence
→ comparison
→ summary
→ references
→ appendix
```

不要把文章段落直接塞进页面。

普通正文页建议只保留 3 到 6 行核心文字。

复杂信息优先转换成：

- 图
- 表
- 坐标轴
- 流程图
- 公式
- 推导链
- theorem box
- proof spine

---

# 2. 选择页面类型

优先使用这些版式。

## 极简封面

- 单行或双行标题
- 细横线
- 作者 / 场合 / 日期
- 大片留白
- 不堆摘要

## 左文右图

- 三到五行解释
- 一个主要手绘示意图
- 图承担解释功能

## 两栏数学页

适合：

- case split
- theorem / proof
- assumption / consequence
- two pencils
- self / cross sector

要求：

- 左右栏宽度稳定
- 中间必须有明显 gutter
- 不允许跨栏公式侵入另一栏

## 流程页

- 三到五个步骤
- 使用箭头连接
- 最关键一步用玫红或绿色提示

## 坐标页

适合：

- 复杂度
- 规模
- 稳定性
- 参数区域

使用两个轴解释主要趋势。

## 对比页

适合：

- 两列
- 三列
- 紧凑 table
- method comparison
- case comparison

## Theorem 页

优先结构：

```text
标题
→ assumptions
→ theorem statement
→ 一句 interpretation
```

不要在 theorem statement 上堆 annotation。

## Proof spine 页

适合只展示：

```text
Step 1
→ Step 2
→ Step 3
→ conclusion
```

而不是完整证明全部压进一页。

## 结论页

- 公式式收束
- 一句核心结论
- 底部一条玫红 result box

## 结束页

- Thank you / 感谢
- Questions & discussion
- 保持极简

---

# 3. 使用固定视觉语言

背景：

- 淡暖白
- 接近干净数字纸张

主文字：

- 深蓝黑

蓝色：

- 标题下划线
- 坐标轴
- 推导主线

玫红：

- 结论
- obstruction
- warning
- terminal condition
- result box

绿色：

- 成立条件
- confirmation
- positive branch
- persistent branch

荧光黄：

- 极少量关键词

珊瑚粉：

- exception
- loss
- residual part

---

## 字体

正文和标题固定优先使用：

```text
HanziPen SC
```

与：

```text
assets/preview-cover.png
```

里的字形保持一致。

不设置其他中文字体候选，也不要设置一长串中文 fallback 字体。

渲染环境缺少 `HanziPen SC` 时：

1. 先安装字体
2. 确认字体加载成功
3. 再进行最终导出

不得带着明显替代字形直接交付。

---

## 禁止的商业模板元素

避免：

- 圆角商业卡片
- 大面积阴影
- 渐变
- 装饰图标
- stock photo
- 商务模板
- 大面积纯色色块
- dashboard 风格
- 多余 UI panel
- 大量 icon

视觉目标是：

```text
数字手写讲义
+
数学报告
+
Notability 页面
```

而不是商业汇报模板。

---

# 3.1 数学公式的手写视觉统一

正文和标题固定使用：

```text
HanziPen SC
```

数学公式采用：

```text
结构由数学排版引擎负责
+
字形尽可能手写化
```

的原则。

目标不是粗暴地把整个 KaTeX / MathJax DOM 强制设置为 `HanziPen SC`。

因为 `HanziPen SC` 不具有完整 mathematical glyph coverage。

如果直接覆盖整个数学 DOM，可能导致：

- 大括号损坏
- stretchy delimiter 失效
- fraction 错位
- matrix 错位
- radical 错位
- 上下标错位
- Greek fallback 混乱

---

## 应尽量手写化的数学内容

对公式中的以下内容，优先采用 handwritten-style glyph：

- Latin letters
- digits
- Greek letters
- text
- operator names

例如：

```text
A
B
M
P
s
t
x
y
1
2
μ
ν
λ
α
β
γ
ker
coker
rank
dim
span
im
```

---

## 应保留数学排版引擎的结构

以下元素优先保留专业数学 renderer：

```text
∑
∫
√
⊗
⊕
∧
∨
大型括号
stretchy delimiter
fraction line
matrix
cases
aligned
array
上下标 layout
radical
accent
overline
underline
```

不要强制这些结构使用 `HanziPen SC`。

---

## Math typography override 原则

对于 KaTeX / MathJax 内可安全覆盖的文本类节点，可以应用 handwritten font override，例如：

```text
.mathnormal
mathrm
operatorname
text
普通 mord
Latin glyph
digit glyph
Greek glyph
```

但不得破坏：

```text
mfrac
sqrt
delimiter
stretchy operator
matrix
array
cases
aligned
accent
```

---

## 数学颜色

数学公式不得整体呈现：

```text
纯黑 Computer Modern
```

而正文是：

```text
蓝黑手写体
```

两者必须统一到同一种“蓝黑墨水”视觉语言。

结构数学字体即使保留，也应在：

- color
- weight
- size
- opacity

上与手写正文协调。

---

## 数学公式检查项

handwritten-math 调整完成后必须检查：

- Greek glyph 是否出现突兀 fallback
- Latin glyph 是否明显仍是 Computer Modern
- 数字是否明显割裂
- operator name 是否仍为标准印刷体
- 上下标是否错位
- fraction 是否损坏
- matrix 是否对齐
- cases 是否对齐
- delimiter 是否正常伸缩
- radical 是否正常
- 长公式是否溢出
- 行内公式是否影响 line-height
- display math 是否压住下一段文字

优先级始终是：

```text
数学正确性
>
可读性
>
手写视觉统一
>
装饰性
```

不要为了 100% 手写字形破坏数学结构。

---

# 4. 使用 neat-annotations

项目已在：

```text
assets/neat-annotations.css
```

中本地保存 annotation 样式。

它使用手写箭头把短注释指向目标词，并支持：

- 八个方向
- 多种颜色
- 自定义颜色

中文可以直接写入：

```html
data-note
```

同时在页面样式里覆盖：

```css
:root {
  --ann-font: "HanziPen SC";
  --ann-label-max-width: 220px;
}
```

使用示例：

```html
<span
  class="ann ann-n ann-green"
  data-note="甜点档"
>
  Q4_K_XL
</span>
```

---

## Annotation 硬约束

annotation 使用绝对定位，因此必须主动给它预留空间。

禁止：

- annotation 压住正文
- annotation 压住公式
- annotation 飞出页面
- annotation 与标题重叠
- annotation 多个标签堆在一起
- annotation 长句代替正文

长中文结论必须写在正文。

annotation 只负责：

- 短提示
- 箭头
- highlight
- side note

---

# 5. 制作 HTML

从：

```text
templates/deck.html
```

开始。

保留这些本地资源：

```html
<link rel="stylesheet" href="../assets/base.css">
<link rel="stylesheet" href="../assets/animations.css">
<link rel="stylesheet" href="../assets/neat-annotations.css">
<link rel="stylesheet" href="../assets/template.css">

<script src="../assets/runtime.js"></script>
```

如果项目已经添加：

```text
assets/handwritten-math.css
```

则同时加载：

```html
<link rel="stylesheet" href="../assets/handwritten-math.css">
```

---

## 每页基本结构

每页使用：

```html
<section class="slide" data-title="页面名称">

  <h2 class="slide-title">
    这一页回答的问题
  </h2>

  <!-- 页面内容 -->

  <aside class="notes">
    演讲时补充的一到三句话。
  </aside>

</section>
```

---

## SVG 图表

图表优先使用 SVG 手绘。

线条使用：

```html
stroke-linecap="round"
stroke-linejoin="round"
```

可以适当叠加轻微位移滤镜。

目标是：

```text
略带人工笔触
```

而不是：

```text
故意画得歪歪扭扭
```

---

# 5.1 已有 deck 的 layout repair 模式

当用户要求：

```text
修一下
版式修复
layout repair
有重叠
字体不统一
重新导出
```

必须进入 repair 模式。

---

## Repair 原则

必须：

1. 读取现有 `index.html`
2. 保留原数学内容
3. 保留原 theorem
4. 保留公式
5. 保留 notation
6. 保留 proof structure
7. 只修布局、字体和导出

不得为了方便直接重新生成另一套 deck。

---

## Repair 时允许修改

允许修改：

- grid-template-columns
- flex
- gap
- margin
- padding
- width
- max-width
- line-height
- font-size
- position
- annotation offsets
- SVG dimensions
- section spacing
- result box position
- page split

---

## Repair 时禁止修改

禁止修改：

- theorem 内容
- assumption
- equation
- proof step
- notation
- implication
- conclusion
- reference meaning

---

## 内容过密时

若单页确实无法合理容纳：

可以：

```text
原第 N 页
→ 第 N 页
→ 第 N+1 页 continuation
```

但必须：

- 保持原顺序
- 保持逻辑连续
- 不删除公式
- 不重新解释成不同内容

---

# 6. DOM Collision Audit

正式导出前必须进行 DOM collision audit。

对每页主要元素调用：

```javascript
getBoundingClientRect()
```

检查元素之间的 bounding boxes。

主要检查对象包括：

- `.slide-title`
- 正文 block
- paragraph
- formula block
- display math
- annotation
- result box
- theorem box
- table
- SVG
- code block
- column
- footer
- reference block

---

## Collision 判断

除设计上明确允许的父子包含关系以外，不允许明显 intersection。

如果 annotation、箭头或其他元素确实需要作为设计的一部分压在图上，可以在最小范围的容器上显式添加：

```html
data-layout-overlap-ok
```

纯装饰且不应参与布局审计的元素可以添加：

```html
data-layout-audit-ignore
```

这两个属性只用于已人工确认的例外，不能拿来批量掩盖正文、公式或 result box 的真实重叠。

例如以下情况属于错误：

```text
formula bottom > paragraph top
```

且二者发生明显重叠。

或者：

```text
left-column right
>
right-column left
```

说明双栏已经互相侵入。

---

## 页面边界检查

所有主要元素必须满足：

```text
left >= slide.left
top >= slide.top
right <= slide.right
bottom <= slide.bottom
```

并留出合理安全 margin。

不仅要检查 viewport。

必须检查实际 slide boundary。

---

## Collision audit 后的处理顺序

发现重叠后按以下优先级修复：

1. 调整 gap
2. 调整 margin
3. 调整 padding
4. 调整 grid
5. 调整 column width
6. 调整 block hierarchy
7. 轻微调整 font-size
8. 拆页

不要一上来就缩字体。

---

# 7. 检查与导出

先检查结构：

```bash
python3 scripts/check_deck.py /absolute/path/to/index.html
```

如果结构检查失败：

必须先修复。

不得直接截图。

再运行逐页布局审计：

```bash
node scripts/check_layout.js /absolute/path/to/index.html all
```

审计会检查正文、公式、annotation、result box、表格、SVG 和代码块的页面越界与明显碰撞。任何一页失败都会返回非零退出码。

`scripts/render.sh` 已自动调用同一审计，并且审计的是已经注入锁定字体和静态导出 CSS 的临时 HTML。正常使用 `render.sh` 时无需重复手动执行；单独运行命令适合在导出前定位问题页。

---

# 7.1 Preview-only 单页渲染

逐页 PNG 导出必须优先使用 runtime 的 preview-only 模式。

使用：

```text
index.html?preview=N
```

使当前页之外的所有 `.slide`：

```css
display: none;
```

---

## 禁止使用普通切页状态直接截图

不要依赖：

```text
#/N
```

的普通演示切页状态直接进行最终截图。

原因：

普通演示状态可能仍存在：

- opacity transition
- transform transition
- animation
- 上一页 DOM
- 上一页 fading state

可能造成：

```text
上一页残影
```

---

# 7.2 导出时禁用所有动画

导出截图环境必须注入：

```css
*, *::before, *::after {
  animation: none !important;
  transition: none !important;
}
```

最终 PNG 不得依赖：

- fade-in
- fade-out
- transform
- transition delay
- animation timing

---

# 7.3 PNG 导出

再逐页导出：

```bash
scripts/render.sh \
  /absolute/path/to/index.html \
  all \
  /absolute/path/to/png-output \
  /absolute/path/to/Hanzipen.ttc
```

macOS 上可先在字体册下载：

```text
翩翩体-简
```

脚本应把指定字体文件直接注入临时渲染页面，并在导出前确认字体加载成功。

字体缺失或加载失败时：

```text
停止最终导出
```

不得悄悄使用 fallback 后继续交付。

---

# 8. 导出后的 Visual QA

导出 PNG 之后必须生成：

```text
contact-sheet.png
```

并且必须实际打开检查。

不能只看：

```text
HTML 源代码
```

也不能只看：

```text
check_deck.py
```

因为代码正确不代表视觉没有问题。

---

## Visual QA 必查项目

逐页检查：

### 页面残影

- 是否有上一页残影
- 是否有 transition 中间态
- 是否有隐藏 slide 泄漏

### 正文

- 正文之间是否重叠
- 行距是否足够
- 是否有文字被裁切
- 是否有过小字体

### 公式

- 公式是否压正文
- 公式是否出界
- display math 是否过密
- fraction 是否完整
- matrix 是否完整
- cases 是否完整
- delimiter 是否正常
- 上下标是否清楚

### Annotation

- 是否挡住正文
- 是否挡住公式
- 是否超边界
- 箭头是否指错对象

### Result box

- 是否压住正文
- 是否压住 footer
- 是否过高
- 是否超边界

### 两栏

- gutter 是否清楚
- 左右栏是否互相侵入
- 两栏公式是否发生跨栏碰撞

### 字体

- HanziPen SC 是否正确加载
- 中文是否出现 fallback
- Latin 是否明显割裂
- Greek 是否突兀
- operator name 是否还是强烈印刷体
- 数学结构是否保持正确

### 可读性

- 投影环境是否仍可读
- 是否为了塞内容缩得太小
- 一页是否仍然只有一个主要问题

---

# 9. Handwritten Math Visual QA

包含数学公式的页面必须额外检查。

重点页面通常包括：

- theorem
- MC sectors
- Smith form
- tangent cone
- initial ideal
- E_l
- canonical P1
- canonical P2
- matrix pencil
- final summary
- appendix formulas

检查：

```text
Greek fallback
Latin fallback
operator names
digit style
matrix alignment
fraction alignment
subscript
superscript
delimiter sizing
radical
formula color
```

---

## 不允许的效果

例如：

```text
正文：
HanziPen SC 蓝黑手写

公式：
纯黑 Computer Modern
```

这是视觉不统一。

目标应该是：

```text
整个页面像同一个人在数字笔记中写出来
```

但不能牺牲数学 renderer 的结构能力。

---

# 10. Contact Sheet 二次检查

第一次生成 contact sheet 后：

不得直接宣布完成。

必须：

1. 查看 contact sheet
2. 找出异常页
3. 单独打开这些 PNG
4. 修改 HTML / CSS
5. 再 render
6. 再生成 contact sheet
7. 再检查

直到没有明显：

- overlap
- clipping
- ghosting
- overflow
- broken math
- unreadable text
- severe font mismatch

才允许交付。

---

# 11. 修复优先级

若同时存在多个问题，按以下顺序处理：

```text
1. 数学错误
2. 内容缺失
3. 页面越界
4. 元素重叠
5. 导出残影
6. 数学结构损坏
7. 字体 fallback
8. 手写视觉不统一
9. annotation 美化
10. 微小视觉调整
```

不得为了修第 8 项破坏第 1～6 项。

---

# 12. 数学内容密度规则

对于公式密集页，不要按照普通商业 PPT 的“少字原则”机械删内容。

数学报告允许：

- 多公式
- notation
- proof chain
- definitions

但必须保持：

```text
视觉层级明确
+
公式之间有呼吸空间
+
读者知道当前在证明什么
```

推荐：

```text
标题
↓
一句 context
↓
主公式
↓
解释
↓
next step
```

避免：

```text
十几个公式无层级堆在一起
```

---

# 13. 页面拆分原则

若页面包含：

- 两个独立证明步骤
- 两个 case
- theorem + 长证明
- 一个巨大 matrix + 多段解释
- 两套独立 pencil
- 超过一屏的公式链

应优先拆页。

例如：

```text
Theorem A — proof spine
Theorem A — necessity
Theorem A — sufficiency
```

比把全部内容塞进一页更好。

---

# 14. 字体尺寸原则

不要硬编码一个所有页面都适用的极小字号。

优先保证：

```text
标题 > 主公式 > 正文 > reference / note
```

字号层级必须肉眼明显。

当正文为了不溢出需要降到明显不可投影阅读的程度：

```text
必须拆页
```

而不是继续缩。

---

# 15. 动画原则

动画只用于浏览器演示。

最终 PNG 导出时：

```text
全部关闭
```

不得出现：

- 半透明正文
- fade 中间态
- transform 中间态
- 前后两页同时存在
- delayed element 未显示完整

---

# 16. 输出目录建议

推荐：

```text
output/<主题>-handwritten-ppt/

  index.html

  style.css

  assets/

  png/
    slide-01.png
    slide-02.png
    slide-03.png
    ...

  contact-sheet.png

  prompts.md
```

如果进行了 repair，也建议保留：

```text
repair-notes.md
```

记录：

```text
哪些页修复
修复了什么
是否拆页
是否修改字体
是否修复残影
```

---

# 17. 最终交付内容

最终至少提供：

- 修复或生成后的 `index.html`
- 全部 PNG
- `contact-sheet.png`
- 必要 CSS
- 必要 assets
- 修改说明

如果是 layout repair，需要明确说明：

```text
Page N:
- fixed formula/body overlap
- increased column gutter
- moved annotation
- split dense content

Page M:
- fixed previous-slide ghosting
```

---

# 18. 最终完成 Gate

在宣布完成之前，逐项确认：

```text
[ ] index.html 可以打开
[ ] 16:9 正常
[ ] 无 scroll
[ ] 无 overflow
[ ] 无正文重叠
[ ] 无公式重叠
[ ] 无 annotation 遮挡
[ ] 无 result box 遮挡
[ ] 无上一页残影
[ ] 无严重字体 fallback
[ ] 数学结构完整
[ ] check_deck.py 通过
[ ] 全部 PNG 已生成
[ ] contact-sheet.png 已生成
[ ] contact sheet 已实际查看
[ ] 异常页已进行第二轮修复
```

只要其中任何关键项失败：

```text
任务尚未完成
```

---

# 随附内容

- `templates/deck.html`：可直接改写的基础模板
- `assets/template.css`：通用手写风样式
- `assets/neat-annotations.css`：手写 annotation
- `assets/runtime.js`：演示和 preview runtime
- `examples/deepseek-v4-flash/`：完整示例
- `references/style-guide.md`：风格拆解、提示词和 HTML 规范
- `scripts/check_deck.py`：结构检查
- `scripts/check_layout.js`：逐页 DOM 越界与碰撞检查
- `scripts/render.sh`：逐页 PNG 导出

---

# 核心原则

最终目标不是：

```text
让页面看起来像一个商业模板套了手写字体
```

而是：

```text
像数学研究者在 Notability 上认真整理的一场报告
```

要求同时满足：

```text
数学正确
+
逻辑清楚
+
排版稳定
+
手写视觉统一
+
可投影阅读
```

任何时候：

```text
数学正确性
>
内容完整性
>
可读性
>
视觉一致性
>
装饰效果
```


---
## Handwritten decoration system

Use `handwritten-effects.css` for visual annotation.

Rules:

- Maximum 1–2 highlighter effects per slide.
- Maximum one major rough box per slide.
- Yellow = main theorem / key result.
- Green = sufficiency / solved / existence.
- Red = obstruction / warning / contradiction.
- Light blue = definition / notation / structure.
- Use hand-wave or hand-underline for lemma names and proof-step labels.
- Do not apply decorative effects to every formula.
- Never allow highlights, annotations, arrows, or sketch elements to overlap mathematical content.
- For geometric or conceptual diagrams, prefer `.sketch-space`, `.sketch-grid`, or `.sketch-dots`.
- Reserve enough whitespace for hand-drawn figures rather than shrinking text.
- SVG diagrams should use:
  - `.sketch-path`
  - `.sketch-path-red`
  - `.sketch-path-green`
  - `.sketch-shape`
  - `.sketch-label`
