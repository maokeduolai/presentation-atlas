# 手动发布 GitHub Release

当前版本为 `0.1.0`，建议标签 `v0.1.0`，标题 `Presentation Atlas v0.1.0`。

## 构建附件

在项目根目录执行 `npm test`、`npm run build`、`npm run verify:release`。

- `outputs/presentation-atlas-portable.zip`：完整便携包，含离线网页、机器数据、Python 查询工具及说明。解压后用现代浏览器打开 `index.html`；浏览功能无需安装依赖。
- `outputs/presentation-atlas-offline.html`：单文件网页，直接用现代浏览器打开；不包含独立 JSON 与 Python 工具。

这两项作为 Release 附件上传，不需要取消 `.gitignore` 对 `outputs/` 的忽略。

## GitHub 网页操作

1. 先将整理后的源码提交并上传，确认目标分支上的源码与构建附件对应。本地初始化并不会自动创建首次提交。
2. 仓库右侧进入 `Releases`，点击 `Draft a new release`。
3. 在 `Choose a tag` 输入 `v0.1.0` 并创建新标签；`Target` 选择刚上传源码的分支，通常为 `main`。无需事先在本机创建标签。
4. 标题填写 `Presentation Atlas v0.1.0`，正文说明功能、附件区别和使用步骤。
5. 将便携 ZIP、单文件 HTML 与可选 `SHA256SUMS.txt` 拖入附件区，等待上传完成。
6. 先保存草稿并检查；正式版本不勾选 `This is a pre-release`，可勾选 `Set as latest release`，再点击 `Publish release`。若希望发布测试版本，再选择预发行。
7. 从发布页下载便携 ZIP 并解压检查，再向使用者提供发布页链接。

GitHub 自动显示的 `Source code (zip)` / `Source code (tar.gz)` 是标签对应的源码快照。供直接使用的文件应选择手动上传的便携 ZIP 或单文件 HTML。

若启用不可变发行，发布后附件无法替换，需先在草稿中上传并检查所有附件。源码修改后应重新构建并使用新版本号发布，保持附件与标签对应。

官方说明：[管理仓库中的发行版](https://docs.github.com/en/repositories/releasing-projects-on-github/managing-releases-in-a-repository)。
