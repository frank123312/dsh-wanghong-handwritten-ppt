# dsh-wanghong-handwritten-ppt

把文章、讲稿或技术主题制作成 16:9 的 Notability 学术手写风 HTML 幻灯片，并逐页导出 1920×1080 PNG

这套 Skill 保留三个核心特征：极简封面、连续清楚的逻辑链、工整且有手写温度的图表与标注

![封面预览](skills/wanghong-handwritten-ppt/assets/preview-cover.png)

![图解预览](skills/wanghong-handwritten-ppt/assets/preview-diagram.png)

## 能做什么

- 将技术文章、讲稿、论文解读拆成 12 到 24 页演示文稿
- 生成固定 16:9 的可翻页 HTML
- 使用深蓝、玫红、绿色与荧光色表达推导关系
- 支持手绘流程、坐标轴、对比表、结论框和中文箭头标注
- 逐页导出 1920×1080 PNG，并检查字体、溢出和讲稿备注
- 随插件分发模板、完整示例、风格说明、提示词与检查脚本

## 安装

```sh
dsh plugin --profile web add github:tjxj/dsh-wanghong-handwritten-ppt
```

安装完成后重启 `dsh web`，在新会话中直接说：

```text
用王虹手写 PPT 风格，把这篇文章做成一套 16:9 幻灯片，并导出逐页 PNG
```

也可以显式加载技能：

```text
/wanghong-handwritten-ppt
```

## 运行要求

- Node.js `^22.19.0` 或 `>=24.0.0`
- 导出 PNG 时需要 Google Chrome
- macOS 字体册中的“翩翩体-简”，渲染脚本会验证字形并在失败时停止

## 本地验证

```sh
npm test
npm run pack:check
```

## 如何进入 dsh-plugin 目录

GitHub 的 `dsh-plugin` 页面由 Topic 自动聚合。仓库公开后，在仓库 Topics 中加入 `dsh-plugin` 即可被发现

```sh
gh repo edit tjxj/dsh-wanghong-handwritten-ppt --add-topic dsh-plugin
```

本仓库同时包含 `package.json` 中的 `dsh.bundle` 声明、`cordis.patch.yml` 和可加载入口，DSH 可以把它作为组合包直接安装

## 许可证

MIT。`skills/wanghong-handwritten-ppt/assets/` 中复用的第三方资源保留各自许可证文件
