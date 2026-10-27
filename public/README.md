# 演示设计图谱 / Presentation Atlas

面向学术报告、技术分享与课程教学的本地静态工具。使用 reveal.js 展示不同设计语言，提供可复制的“历史定位＋风格指南＋当前配色＋生成提示词”。

## 运行

推荐 Node.js 22 或更新版本。

```bash
npm ci
npm run dev
```

生产构建与检查：

```bash
npm test
npm run build
npm run verify:release
npm run preview
```

构建需要 Python 3（仅标准库，用于 ZIP），无需额外 pip 依赖。预览地址通常为 `http://127.0.0.1:4173/`。生产文件在 `outputs/`；普通 `index.html` 通过 HTTP 静态服务访问，资源采用相对路径，可放入静态站点子目录。运行时无外部字体、图片或 CDN 请求，来源链接在用户主动打开时访问。

## 离线与 AI 查询

`npm run build` 一次生成三种交付：普通 HTTP 站点、`outputs/presentation-atlas-offline.html` 单文件版、`outputs/presentation-atlas-portable.zip` 便携包。ZIP 解压后用现代浏览器打开其中的 `index.html`；浏览和导出无需 Node.js、Python 或网络。Python 仅用于可选查询工具。

AI 可以读取 `outputs/api/v1/index.json` 作初筛，再读取 `styles/{id}.json`；也可以直接读取 `outputs/api/v1/catalog.json` 的完整资料，或文本版 `outputs/llms-full.txt`。后者采用每项第一配色＋分类图表。完整 JSON 中的 180 个风格／配色／图表组合与网页提示词、CSS、完整包逐字同步。

在 ZIP 解压目录或 `outputs/` 内运行：

```bash
python3 atlas.py search --context academic --daily --limit 5
python3 atlas.py show swiss --palette cobalt-grid --chart diverging --format pack
python3 atlas.py serve --port 8765
```

Windows 可用 `py -3 atlas.py`。本地服务提供 `/api/v1/styles?context=academic&daily=true` 和 `/api/v1/styles/swiss?palette=cobalt-grid&chart=diverging` 两个只读 GET 接口；普通 Vite／静态部署仅提供 JSON／Markdown 文件。命令行与 HTTP 均支持场景、身份、日常适配和文字筛选，不冒充语义推荐。

远程聊天 AI 无法直接访问你电脑的 localhost；可附上 JSON／TXT，或自行部署静态站点后提供完整 URL。网页新增“AI / 离线”入口，可复制 AI 使用说明、导出机器资料及下载 ZIP／单文件。完整契约、参数与示例见 `public/AI-GUIDE.md`，交付副本在 `outputs/AI-GUIDE.md`。

单文件版的运行代码、CSS、风格数据与 reveal.js 都已内联，采用经典脚本，不依赖 `file://` 下的模块加载或 fetch。系统文件预览器可能限制脚本，尤其在手机上；应使用支持本地 HTML 的现代浏览器。构建不会把 `node_modules` 放进 ZIP。

## 已实现

- 30 个条目、每项两套改编配色（包含共享的基础色系）。历史运动／学校／倾向、专业方法、印刷与材料、文化审美、界面趋势、应用预设分别标记。
- 身份、场景与日常适配独立筛选；支持中英文、旧名称和形式语言检索，视觉卡片与时间脉络两种浏览方式。
- 每项具有独立构图、字形关系、几何与材料规则；缩略图和详细预览共用渲染器。四页共同样例涵盖标题、方法、图表与媒体。
- 灰度对照、放大预览；分类、顺序、发散图表示例及独立色系。
- 背景、表面、正文、次要文字、强调、边界和状态颜色按角色输出；列出实际实色组合对比度。
- 当前提示词、完整包、CSS 角色变量均可复制；完整包可展开阅读或下载为 Markdown。
- 原生对话框焦点管理、Escape 关闭、预览方向键翻页、可见焦点、减少动态效果支持。
- 媒体页含明确的视频占位和可操作的分组提示滑块，支持键盘调整与重置。

## 内容与实现

| 文件 | 用途 |
| --- | --- |
| `src/catalog.js` | 历史身份、年代边界、关系、来源、形式语言 |
| `src/palettes.json` | 两套基础配色及改编说明；可按条目复用 |
| `src/styles.js` | 场景、旧称、颜色角色、对比度与导出 |
| `src/slides.js` | 共用样例与每项图形构成 |
| `src/specimens.css` | 封闭的预览字体与构图规则 |
| `src/main.js` / `src/style.css` | 工具界面与交互 |
| `src/ai-data.js` | 从共用模型生成机器索引、完整资料与 AI 选型原则 |
| `scripts/build.mjs` / `scripts/export-data.mjs` | 静态站点、数据与单文件 HTML 构建 |
| `scripts/zip.py` | ZIP 打包与 SHA-256 文件清单 |
| `public/atlas.py` | Python 标准库 CLI 与可选本地只读 HTTP 查询 |
| `public/AI-GUIDE.md` | AI 接口契约与离线使用说明 |
| `public/revision-plan.md` | 需求、实施计划及完成记录 |
| `public/validation.md` | 验证结果与边界 |

年份是浏览锚点，不是统一发明日期。预设不虚构历史起源，配色不宣称历史标准。Carbon 提供规范参考；演示画布、字号和风格转译属于本项目改编。图表色系按 Carbon 色卡抽样与组合，不将全部组合称为官方完整调色板。

完整包用于指导后续演示制作；CSS 导出仅含颜色角色，不是可直接套用的整套 reveal.js 主题。预览图表使用示例数据，视频尚需接入实际素材。实色对比度检查不等于投影可读性验证或完整 WCAG 认证。

第三方说明见 `public/THIRD-PARTY-NOTICES.md`。

## 源码仓库与维护

源码仓库保留 `src/`、`public/`、`scripts/`、`tests/`、`docs/`、入口与配置文件，以及 `package.json`／`package-lock.json`。目录职责与发布边界见源码中的 `docs/REPOSITORY.md`（该维护文档不随静态站点或便携包分发）。

`node_modules/` 是本机依赖；`outputs/` 是构建产物；`work/` 包含开发备份、截图与构建中间文件。这些目录由 `.gitignore` 排除，发布源码时无需提交；可通过安装依赖与构建重新生成应用交付文件。历史截图不会由干净构建自动重建。

修改内容应维护源码或 `public/` 原件，然后运行测试、构建和发行校验；不要单独编辑生成的 JSON、HTML 或 ZIP。`public/README.md` 是本说明的交付副本，应与根 README 同步。单文件 HTML 与便携 ZIP 可单独作为发行附件提供。源码上传与网页部署是两个步骤，当前项目未配置 GitHub Pages 或持续集成。

项目按所有者决定不添加项目自身的 LICENSE；已有第三方许可说明继续保留于 `public/THIRD-PARTY-NOTICES.md`。
