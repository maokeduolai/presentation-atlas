import { build } from 'vite';
import { cp, mkdir, readdir, readFile, writeFile, stat } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { exportData } from './export-data.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const output = join(root, 'outputs');
const savedScreenshots = join(root, 'work/saved-screenshots');
if (await stat(join(output, 'screenshots')).catch(() => null)) await cp(join(output, 'screenshots'), savedScreenshots, { recursive: true });
// Ordinary HTTP site plus generated static API. All exports use the same styles.js model.
await build({ root, build: { outDir: output, emptyOutDir: true } });
if (await stat(savedScreenshots).catch(() => null)) await cp(savedScreenshots, join(output, 'screenshots'), { recursive: true });
await exportData(output);

// A classic IIFE, inline CSS and inline data also work from file:// without a module loader or fetch.
const scratch = join(root, 'work/portable-assets');
await build({
  root, configFile: false, publicDir: false,
  build: { outDir: scratch, emptyOutDir: true, target: 'es2020', cssCodeSplit: false,
    lib: { entry: join(root, 'src/main.js'), name: 'PresentationAtlas', formats: ['iife'], fileName: () => 'atlas.js' } }
});
const js = await readFile(join(scratch, 'atlas.js'), 'utf8');
if (/\bimport\s*\(|\bimport\.meta/.test(js)) throw new Error('Portable build still requires module loading');
const css = (await Promise.all((await readdir(scratch)).filter(n => n.endsWith('.css')).map(n => readFile(join(scratch, n), 'utf8')))).join('\n');
if (/url\(\s*["']?(?:https?:|\/\/|\.(?:\.?)\/)/i.test(css)) throw new Error('Portable build has an external CSS asset');
let html = await readFile(join(root, 'index.html'), 'utf8');
const notices = await readFile(join(root, 'public/THIRD-PARTY-NOTICES.md'), 'utf8');
if (notices.includes('-->')) throw new Error('Third-party notices contain an HTML comment delimiter');
html = html.replace('<html lang="zh-CN">', '<html lang="zh-CN" data-portable="true">')
  .replace('<head>', () => `<head>\n<!--\n${notices}\n-->`)
  .replace('</head>', () => `<style>${css.replace(/<\/style/gi, '<\\/style')}</style>\n</head>`)
  .replace(/<script type="module"[^>]*><\/script>/, () => `<script>${js.replace(/<\/script/gi, '<\\/script')}</script>`);
await writeFile(join(output, 'presentation-atlas-offline.html'), html);

const portable = join(output, 'presentation-atlas-portable');
await mkdir(portable, { recursive: true });
await writeFile(join(portable, 'index.html'), html);
for (const name of ['api','atlas.py','AI-GUIDE.md','llms.txt','llms-full.txt','README.md','THIRD-PARTY-NOTICES.md','revision-plan.md','validation.md']) {
  await cp(join(output, name), join(portable, name), { recursive: true });
}
await writeFile(join(portable, 'START-HERE.txt'), `演示设计图谱 / Presentation Atlas\n\n1. 解压整个 ZIP 到任意文件夹。\n2. 用现代浏览器打开 index.html（双击或“打开文件”）；无需安装 Node.js 或联网。\n3. 浏览、换色、预览和导出完整包均在本地运行。来源链接需要联网。\n4. AI 使用：附上 api/v1/catalog.json 或 llms-full.txt，并阅读 AI-GUIDE.md。\n5. 可选：安装 Python 3.9+ 后运行 python3 atlas.py search --context academic --daily。\n   Windows 可用 py -3 atlas.py；本地网页/API：python3 atlas.py serve。\n\n单独传输 index.html 即可浏览全部风格；机器数据、CLI 与说明需保留整个目录。\n手机浏览器若受系统文件预览器限制，请用电脑双击，或启动本地服务后在本机浏览器访问。\n此便携包中“重新打包 ZIP”需回源码项目运行 npm run build。\n`);
// ZIP generation is cross-platform, implemented using the Python standard library.
const { spawnSync } = await import('node:child_process');
const zipScript = join(root, 'scripts/zip.py');
let result;
for (const [command, prefix] of process.platform === 'win32' ? [['py', ['-3']], ['python', []]] : [['python3', []], ['python', []]]) {
  result = spawnSync(command, [...prefix, zipScript, portable, resolve(output, 'presentation-atlas-portable.zip')], { encoding: 'utf8' });
  if (!result.error || result.error.code !== 'ENOENT') break;
}
if (result.error || result.status) throw new Error(`ZIP build failed (Python 3 required): ${result.error || result.stderr}`);
console.log(result.stdout.trim());
