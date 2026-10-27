# AI 选型与离线使用

网页、JSON、Markdown 和查询结果都由同一份风格数据生成。当前契约版本为 `1.0.0`，包含 30 项、每项两套改编配色及三种图表模式。新增字段可在 v1 中兼容加入；破坏性结构变化应使用新的路径版本。`content_verified_on` 表示历史内容核对日期，不是每次打包日期。

## 选一个适合你的入口

| AI 的能力 | 使用方式 |
| --- | --- |
| 可读取附件或本地文件 | 提供 `api/v1/catalog.json`；若只支持文本，提供 `llms-full.txt` |
| 有本机命令行能力 | 使用 `atlas.py search` 和 `atlas.py show`；无需启动服务 |
| 能访问本机 HTTP | 启动 `python3 atlas.py serve`，使用下述只读查询接口 |
| 只能浏览公开网页 | 需要你自行将站点部署到可访问的静态地址，然后提供 `llms.txt` 或 JSON 的完整 URL |

远程聊天 AI 无法自动访问你电脑的 `localhost` 或本地文件。无需账号、API Key 或调用模型服务；这里提供资料与筛选工具，选型推理由读取资料的 AI 完成。`llms.txt` 是发现资料的约定入口，不保证所有 AI 会自动读取。

## 建议交给 AI 的任务说明

```text
请先读取随附的 Presentation Atlas catalog.json。
根据我接下来提供的主题、主要目的、听众、报告时长、信息密度、
图表／代码／视频／互动比例、投影条件和视觉偏好，推荐 2—3 个候选。
结合 summary、visual、dont、contexts、fit 说明取舍，再选出一个方案。
报告最终 style_id、palette_id、chart，并使用对应 variants 项的 complete_pack。
缺少重要约束时先说明假设。不要凭名称选择，也不要只给同一版式换色。
不要把应用预设称为历史流派，把改编配色称为历史标准色。
若你无法读取文件，请明确说明，不要假装已查询。
```

AI 应先理解内容与目的，再查询。`q` 是不区分大小写的文字检索，以空格分隔的词均须出现在同一条目中；不是向量检索。不要直接把一整段自然语言需求塞进 `q`。宽泛需求先用场景筛选，再由 AI 阅读候选的指南作比较。`fit` 与场景为项目评估，不能当作历史价值或客观质量评分。

## 静态文件接口（HTTP 部署或直接读文件）

| 路径 | 内容 |
| --- | --- |
| `llms.txt` | AI 入口与使用原则 |
| `api/v1/index.json` | 轻量索引、枚举、指南、配色 ID 与详情路径 |
| `api/v1/catalog.json` | 完整条目、所有配色／图表组合、指南、提示词、CSS、来源 |
| `api/v1/styles/{id}.json` | 一项的全部历史信息与配色组合 |
| `api/v1/packs/{id}.md` | 一项的**第一配色＋分类图表**完整包 |
| `llms-full.txt` | 全部条目的可读文本，同样采用第一配色＋分类图表 |

索引内 `detail`、`default_pack` 相对于 `api/v1/`。稳定风格 ID 例：`swiss`。配色 ID 从每项 `palettes[].id` 获取，例如 `cobalt-grid`。ID 不应随显示名称的翻译改变。年份 `year` 是浏览锚点，允许 `null`；具体历史范围读取 `era`／`history`。`kind` 六类：`history`、`method`、`process`、`culture`、`interface`、`preset`。

完整条目 `palettes[]` 中包含：

- `roles`：语义角色及分类、顺序、发散色系。`contrast_checks`：六种明确的实色组合、原始比值、参考阈值与是否达到。
- `variants.categorical|sequential|diverging`：各自的 `css`、`prompt`、`complete_pack`，与网页导出逐字同步。
- `sources`／`common_sources`：历史依据与共通规范来源。配色是项目改编；CSS 仅为颜色角色，不能直接替代完整 reveal.js 主题。

例（JavaScript，静态 HTTP）：

```js
const catalog = await fetch('./api/v1/catalog.json').then(r => r.json());
const style = catalog.styles.find(s => s.id === 'swiss');
const palette = style.palettes.find(p => p.id === 'cobalt-grid');
const pack = palette.variants.diverging.complete_pack;
```

浏览器对 `file://` 的 fetch 有限制；双击网页不需要 fetch。AI 可直接读 JSON 文件，或用下述 CLI／本地 HTTP。

## 无依赖 CLI（Python 3.9+）

在解压目录运行。Windows 将 `python3` 替换成 `py -3` 或已安装的 `python`。

```bash
python3 atlas.py search --context academic --daily --limit 5
python3 atlas.py search --q "grid" --context technical
python3 atlas.py search --kind history --context history
python3 atlas.py show swiss --palette cobalt-grid --chart diverging
python3 atlas.py show swiss --palette cobalt-grid --chart diverging --format pack > selected-style.md
```

场景接受 `academic`／`technical`／`teaching`／`history` 或中文标签。`--daily` 只保留日常适配“高”；`--limit` 为 1—100，默认 30。搜索按适配高／中／低排序，同级保持目录顺序。返回候选与命中数量，不虚构智能推荐分数。

`show` 默认第一套配色、`categorical`；JSON 返回历史信息、当前角色、六种组合实测、CSS、提示词、完整包和共通规范。不存在的 ID、配色或不合法参数会报错并以非零状态退出。

## 可选本地 HTTP 查询接口

```bash
python3 atlas.py serve --port 8765
curl 'http://127.0.0.1:8765/api/v1/styles?context=academic&daily=true&limit=5'
curl 'http://127.0.0.1:8765/api/v1/styles/swiss?palette=cobalt-grid&chart=diverging&format=pack'
```

仅绑定本机 `127.0.0.1`。浏览器可在同一地址打开网页；Ctrl+C 停止服务。不提供公网托管或模型调用。

| GET 路径 | 参数 |
| --- | --- |
| `/api/v1/styles` | `q`、`context`、`kind`、`daily=true|false`、`limit=1..100` |
| `/api/v1/styles/{id}` | `palette`、`chart=categorical|sequential|diverging`、`format=json|pack` |

JSON 结果使用 `application/json; charset=utf-8`；完整包使用 UTF-8 文本。坏参数返回 400，未知风格返回 404，错误为 `{"error":"..."}`。只支持 GET／HEAD；其他方法不写入文件。普通静态服务器只提供 `.json`／`.md` 文件，不支持这两个动态查询路径。

## 移动与离线

下载 `presentation-atlas-portable.zip` 后**先解压整个文件夹**，再用现代浏览器打开其中的 `index.html`。不需要 `npm install`、Node.js、Python 或网络即可浏览和导出；Python 仅用于可选 CLI／HTTP。单独的 `presentation-atlas-offline.html` 也能独立浏览，JSON／CLI／说明在 ZIP 内。

HTML 的运行代码、CSS、数据与 reveal.js 已内联，字体使用系统回退，不请求 CDN。来源网页需要联网，媒体页仍为明确的视频占位。系统字体不同会产生细微排版差异；手机系统文件预览器可能不执行脚本，需使用能打开本地 HTML 的现代浏览器。浏览器剪贴板受权限限制时，可展开文本手动复制或下载 Markdown。

ZIP 中含来源与 reveal.js 许可。重新打包在源码项目运行 `npm ci`、`npm test`、`npm run build`（构建推荐 Node 22+、需要 Python 3）。不要直接手工改导出的 JSON；修改 `src/catalog.js`、`src/palettes.json`、`src/styles.js`，再构建，避免网页与 AI 资料不一致。
