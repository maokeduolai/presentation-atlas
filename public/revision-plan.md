# 演示风格库修改计划

更新：2026-10-23。状态：已按用户实施指令完成改版、构建与浏览器检查。

## 需求与边界

- 用于学术报告／技术分享为主、课程教学为辅的 HTML 演示；继续采用 reveal.js。
- 用户认可此前四项修正：分开历史身份与应用场景、呈现历史关系、注明配色为演示改编、让预览体现形式语言。形式语言预览是核心优先项。
- 保留查询、可视化预览和复制“风格指南＋提示词＋配色”的工作流，兼顾日常方案与历史备选。
- 研究并选择性吸收 Carbon 的规范，使之进入操作界面、演示的共同质量要求和复制内容；各风格仍保有自己的视觉规则。
- 已收到“请开始实际修改构建”的实施指令。本轮交付可运行网页、更新后的说明与验证记录。

## 改版前基线（已修正）

- `src/main.js` 的 `miniPreview()` 与 `buildSlides()` 复用相同结构，主要改变颜色和文字；缩略图与真实预览均需修正。
- `src/styles.js` 混合历史运动、学校、方法、印刷技术、文化审美、界面趋势及项目预设，缺少关系与出处字段。
- 配色仅按五个槽位分配；图表颜色直接取自页面配色，缺少数据类型与颜色语义。
- “投影对比度已优化”是固定文案，未实际检测；提示词复制未自动带入所选配色。

## 设计原则

1. Carbon 是 IBM 的开源产品设计系统，提供规范与实现，不是历史流派或通用审美标准，也不是 reveal.js 演示规范。
2. 分三层：工具操作界面保持一致；演示共有质量规则负责可读性、数据语义和交互；风格规则控制版式、字体关系、图像处理、形状、装饰与材料效果。
3. 参考 Carbon 的角色化颜色、层级、间距、交互与可访问性；不把 IBM 蓝、IBM Plex、固定网格或 IBM 动效限制强加给全部历史风格。
4. Carbon 的屏幕字号、WCAG 对比度不等于投影可读性；单独制定演示画布、缩放、中文字体、正文与图表标注规则，明确标为本项目的演示改编。
5. 史实来自博物馆／档案等出处；Carbon 负责规范参考。区分官方规则、项目改编和实测结果，附来源与核对日期。

## 实施顺序

- [x] **P1 内容与分类**：增加身份、起源／活跃期、历史关系、来源与改编说明；场景与适配程度独立筛选，支持按时间浏览。不再把现有 25 项当作 25 个并列流派；保留预设但标明性质。纠正前轮已核实的名称与年代，补必要历史桥梁。
- [x] **P2 形式语言预览**：为每项建立版式、字体层级、构图、图像／材料、装饰、配色和禁忌规范；采用共同的学术样例内容与数据，分别生成标题、内容／方法、图表和媒体页。可共享有历史依据的布局基础，但不能仅换色；有意保留真实的历史重叠。
- [x] **P2 预览一致性**：卡片缩略图、详情预览与复制包使用同一份风格规范；换色保留风格结构，换风格更新形式语言。支持放大查看，给出简短的形式语言解释；视频／交互占位明确标识，避免把占位宣称成已实现的功能。
- [x] **P3 内化 Carbon**：操作界面采用一致的间距、文字层级、按钮主次、选中／焦点／禁用状态和反馈。演示侧借鉴语义颜色、数据图表规范、键盘操作及克制动效；不直接照搬产品界面的密度与小字号。
- [x] **P3 配色与数据**：将颜色映射到背景、表面、正文、次要文字、强调、边界、状态及图表系列；区分分类、顺序、发散数据配色，辅以标签／形状／线型。改编配色不冒充历史标准色或官方 Carbon 调色板。
- [x] **P3 实测与可访问性**：报告实际前景／背景组合的对比度；普通文本参考 4.5:1，大文本参考 3:1，必要控件边界／状态参考 3:1。渐变、透明、图片背景不能仅测两个原始 HEX 值；无法覆盖时标待检查，不显示通过。检查键盘顺序、可见焦点、详情打开／关闭后的焦点管理、复制成败反馈、减少动态效果。以上不是完整 WCAG 合规认证。
- [x] **P4 指南与复制包**：输出“历史定位／来源＋风格形式语言＋所选角色配色＋演示共通规则＋媒体／交互要求＋reveal.js 提示词”；短提示词和完整包均反映当前选择。界面用简明说明，技术变量保留在主动查看／复制的区域。
- [x] **P4 验收**：先完成瑞士风格、包豪斯明确阶段的改编、构成主义、孟菲斯四个样板，核对历史差异后覆盖全部保留项；在相同内容、必要时统一中性色下辅助比较构图与字体差异，不要求所有流派仅凭灰度即可辨认。验证中文、窄屏、放大预览、图表、换色、复制与键盘流程，并检查构建。

## 实现约束

- 保持当前静态网页与 reveal.js 路线；是否采用 Carbon 组件包另按收益评估，不预设迁移 React、接入 Figma／MCP 或增加服务端。
- 全局操作界面与演示风格样式隔离，避免基础规范覆盖历史风格；关键可读性与交互要求优先于装饰效果。
- 把 Carbon 方法转为可检查的设计规则；安装组件库不能替代形式语言设计。复用代码、字体或图标时按各资产自身许可保留出处。

## 官方资料索引（核对于 2026-10-23）

- [Carbon 首页](https://www.carbondesignsystem.com/)；[开源项目](https://github.com/carbon-design-system/carbon)
- [2x Grid](https://www.carbondesignsystem.com/building-blocks/foundations/2x-grid/overview)：8 px mini unit 与对齐；不是所有组件间距都必须为 8 的倍数。
- [Spacing](https://www.carbondesignsystem.com/building-blocks/foundations/spacing/overview)：包含 2、4、8、12、16、24、32 等间距级别。
- [Typography](https://www.carbondesignsystem.com/building-blocks/foundations/typography/overview)；[Style strategies](https://www.carbondesignsystem.com/building-blocks/foundations/typography/style-strategies)：依任务区分紧凑操作与阅读展示场景。
- [Color](https://www.carbondesignsystem.com/building-blocks/foundations/color/overview)；[Themes](https://www.carbondesignsystem.com/building-blocks/foundations/themes/overview)：颜色角色稳定，主题值可变。
- [Data visualization palettes](https://www.carbondesignsystem.com/building-blocks/data-visualization/color-palettes)：分类、顺序、发散和状态色用途不同。
- [Accessibility / color](https://www.carbondesignsystem.com/building-blocks/foundations/accessibility/color)；[Text input accessibility](https://www.carbondesignsystem.com/building-blocks/core/components/text-input/accessibility)
- [Motion](https://www.carbondesignsystem.com/building-blocks/foundations/motion/overview)：以引导与反馈为目的，按场景控制表现强度。
- [W3C 对比度说明](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html)：阈值与大文本条件以 W3C 为准，不将演示逻辑画布字号直接当作屏幕实际字号。

维护：主文件是 `public/revision-plan.md`；`outputs/revision-plan.md` 是本轮交付副本，后续 Vite 默认构建会从 public 复制此文件，避免构建清理输出时丢失计划。修改计划时先更新主文件，再同步交付副本。上述待办均已实施。媒体页保留明确的视频占位，滑块交互已实现；未加入用户尚未提供的视频文件。

## 本轮实施记录

- 30 个条目、60 套改编配色；分成历史运动／学校／倾向、方法、印刷与材料、文化审美、界面趋势、应用预设六种身份。日常适配和场景另行标记。
- 增补新艺术运动、新字体运动、有机设计、太空时代设计、原始网页粗野主义；旧称仍可检索。年份标注为浏览锚点，预设不虚构起源。
- 共用渲染器覆盖卡片与 reveal.js；每项采用独立的构图、文字与几何材料规则。提供标题、方法、图表、媒体四页，灰度比较与放大预览。
- 角色配色与状态色独立；图表提供分类、顺序、发散三类。色值按 Carbon 色卡抽样／组合，未宣称所有组合是官方完整调色板。正文、索引及数据使用实色背景。
- 原生 dialog 管理焦点和 Escape；预览区域可用左右键翻页；复制给出反馈，同时提供文本展开与 Markdown 下载。
- 通过 5 组数据／导出／色彩计算测试及生产构建；浏览器检查覆盖筛选、排序、翻页、换色、灰度、交互、下载、焦点恢复和 390／320 px 窄屏。完整验证边界见 validation.md。
- 核心文件：src/catalog.js、src/styles.js、src/slides.js、src/specimens.css、src/main.js、src/style.css。继续扩展时先维护数据与共同渲染器，再修改界面，避免预览与提示词脱节。

## AI 读取与便携交付

- [x] 使用共用模型自动生成版本化 JSON 索引、30 个详情、默认完整包与 llms.txt／llms-full.txt；历史边界与来源保留。
- [x] 完整 JSON 包含每项两套配色 × 三类图表的 CSS、提示词和完整包；与网页导出逐字同步。
- [x] 提供无额外依赖的 Python CLI、场景／身份／日常适配／文字筛选与可选本地只读 HTTP 查询；参数不合法时报错，不虚构推荐分数。
- [x] 新增网页“AI / 离线”入口、可复制任务说明、JSON／TXT 导出与 ZIP／单文件下载。
- [x] 生成内联 CSS、经典脚本与数据的单文件 HTML；便携 ZIP 含说明、机器资料、工具、来源及 reveal.js 许可，无 Node.js 运行要求。
- [x] 增加数据同步、CLI、HTTP、错误参数、跨目录调用及 ZIP 校验；验证范围见 validation.md。
- [ ] 自动化浏览器实际打开 file://：因工具策略与审批拒绝而未完成；未绕过限制，不将静态校验宣称为双击实测。

后续维护：修改 src/ 下的内容后运行 npm test、npm run build、npm run verify:release。导出数据不可手工单独改写；本地接口与 CLI 读取生成的完整 JSON。静态部署不自动提供动态查询接口。
