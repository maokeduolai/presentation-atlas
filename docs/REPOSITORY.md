# 源码目录与发布边界

本文件描述源码仓库的维护方式。普通静态站点、单文件 HTML 和便携 ZIP 的使用方法见项目根目录的 README.md。

## 目录职责

| 路径 | 内容与维护方式 |
| --- | --- |
| `src/` | 前端界面、风格数据、配色、样例渲染与机器数据模型；功能与内容修改的主入口 |
| `public/` | 构建时原样复制的文件：Python 查询工具、AI 指南、第三方说明及历史开发／验证记录 |
| `scripts/` | 站点构建、机器数据导出、便携 ZIP 打包与发行校验 |
| `tests/` | Node.js 数据／导出测试和 Python CLI／HTTP 测试 |
| `docs/` | 仅供源码仓库阅读的维护文档；不会被 Vite 默认复制到站点 |
| `index.html` | Vite 入口 HTML |
| `vite.config.js` | Vite 配置，资源基础路径使用 `./` |
| `package.json` / `package-lock.json` | 项目信息、脚本和锁定的依赖版本；两者均纳入版本管理 |
| `outputs/` | 可重新生成的 HTTP 站点、静态 API、离线 HTML 和便携 ZIP；不纳入源码提交 |
| `work/` | 开发备份、构建中间文件和截图缓存；不纳入源码提交 |
| `node_modules/` | 本机安装的依赖；不纳入源码提交 |

## 开发与验证

开发前安装 Node.js（项目原有说明推荐 22 或更新版本）与 Python 3（CLI 文档要求 3.9+；构建仅使用标准库）。依赖安装命令：

```bash
npm ci
npm run dev
```

提交前运行：

```bash
npm test
npm run build
npm run verify:release
```

运行普通生产站点预览：

```bash
npm run preview
```

`npm test` 直接从源码模型生成测试数据，并将导出与 HTTP 测试数据写入临时目录；不依赖仓库内已有的 `outputs/` 或 `work/`。

修改 `src/` 后重新构建，不手工编辑生成的 API、单文件 HTML 或 ZIP。`public/README.md` 当前是根 README 的交付副本；修改说明时需同步维护，构建会使用 public 内的副本。

## 源码与发行物

- GitHub 源码仓库保存应用源码、脚本、测试、锁文件与文档。
- 单文件 HTML 与便携 ZIP 可在需要时作为发行附件上传；这是手动发布选择，不属于源码提交。
- `outputs/` 可用于静态托管，但源码上传本身不会自动部署网页。当前未配置 GitHub Pages 或持续集成。
- `scripts/build.mjs` 会保留本机已有截图，但源码仓库忽略 `work/` 与 `outputs/`，干净构建不保证带上历史截图；截图不参与发行校验的必需文件集合。

## 保留的历史资料

`public/revision-plan.md` 和 `public/validation.md` 是已有开发资料，包含旧任务上下文与验证边界。当前构建会将它们复制到站点和 ZIP，界面也提供修改记录入口。若以后希望改为仅仓库内归档，需要同时调整构建脚本、README 及界面链接；不要只移动文件。

## 已确认的仓库设置

- 项目包名统一为 `presentation-atlas`，已同步更新 `package.json` 与锁文件根元数据；当前版本保留为 `0.1.0`。
- 所有者决定不添加项目自身的 LICENSE；现有第三方说明继续保留。
- `private: true` 用于防止误发布 npm 包，不决定 GitHub 仓库可见性。
- 已按用户确认初始化本地 Git，初始分支为 `main`；未创建提交、版本标签或绑定远端，源码上传和 Release 发布由用户手动操作。
- 当前版本发布步骤见 `docs/RELEASING.md`。
