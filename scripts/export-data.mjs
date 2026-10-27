import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { styles, completePack } from '../src/styles.js';
import { createIndex, createCatalog, createAIText, paletteId } from '../src/ai-data.js';

export async function exportData(root) {
  const api = join(root, 'api/v1');
  await mkdir(join(api, 'styles'), { recursive: true });
  await mkdir(join(api, 'packs'), { recursive: true });
  const catalog = createCatalog();
  await writeFile(join(api, 'index.json'), JSON.stringify(createIndex(), null, 2) + '\n');
  await writeFile(join(api, 'catalog.json'), JSON.stringify(catalog, null, 2) + '\n');
  for (const s of catalog.styles) {
    await writeFile(join(api, 'styles', s.id + '.json'), JSON.stringify(s, null, 2) + '\n');
    const original = styles.find(x => x.id === s.id);
    await writeFile(join(api, 'packs', s.id + '.md'), completePack(original, original.palettes[0]));
  }
  await writeFile(join(root, 'llms-full.txt'), createAIText());
  await writeFile(join(root, 'llms.txt'), `# Presentation Atlas\n\n面向学术报告、技术分享、课程教学的 reveal.js 设计参考库。\n机器契约版本：${catalog.schema_version}；${styles.length} 项，每项两套改编配色、三种数据图表模式。\n\n## Read first\n- [AI 使用与接口说明](AI-GUIDE.md)\n- [轻量风格索引](api/v1/index.json)\n- [完整机器数据](api/v1/catalog.json)\n- [文本资料，默认配色与分类图表](llms-full.txt)\n- [本地 CLI 与只读 HTTP 服务](atlas.py)\n\n## Selection\n${catalog.selection_guide.map(x => '- ' + x).join('\n')}\n\n## Contract\n索引中的 detail 和 default_pack 路径均相对于 api/v1/。示例：api/v1/styles/swiss.json；api/v1/packs/swiss.md。\n样例默认 palette_id=${paletteId(styles[0].palettes[0])}。各条目的 palette_id 以其 palettes[].id 为准。\n静态部署只提供文件；动态 /api/v1/styles 查询须运行 python3 atlas.py serve。\n本地文件／localhost 只能由有本机访问能力的 AI 读取；远程聊天 AI 请附上 JSON／TXT 文件。\n`);
}
