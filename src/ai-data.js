import { styles, kinds, sources, chartModes, commonRules, rolesFor, checksFor, paletteCSS, makePrompt, completePack } from './styles.js';

export const schemaVersion = '1.0.0';
export const contexts = { academic: '学术报告', technical: '技术分享', teaching: '课程教学', history: '设计史' };
export const selectionGuide = [
  '先读取演示主题、主要目的、听众背景、报告时长、信息密度、图表／代码／视频／互动比例、投影条件和偏好；缺少关键约束时说明假设。',
  '先按 contexts 筛场景；日常报告可优先 daily=true，但不要把 fit 当成历史价值或绝对质量评分。q 是文字检索，不能把整个任务描述当作语义检索。',
  '对照 summary、visual、dont、identity、history 和 related 选出 2—3 个候选，结合具体内容说明取舍。历史运动、方法、预设不是同一层级；不要捏造历史起源或谱系。',
  '选定 style.id 与 palette.id 后，按数据关系选择 categorical、sequential 或 diverging；读取该 variants 项的完整包。图表色系独立于装饰强调色。',
  '建议输出：需求摘要、候选与理由、最终 style_id／palette_id／chart、限制条件；再使用对应完整包生成 reveal.js 演示。必须落实构图、字形、图像与数据、装饰规则，不能只换色。',
  '所有配色为演示改编，不是历史标准色；对比度结果仅覆盖列明的实色组合。具体演示仍需复核投影可读性、真实数据、媒体字幕和交互的静态讲解路径。'
];

// Persisted in palettes.json so translating a display name does not change the API identifier.
export const paletteId = p => p.id;
const metadata = () => ({ schema_version: schemaVersion, content_verified_on: '2026-10-23', language: 'zh-CN', framework: 'reveal.js' });

export function styleSummary(s) {
  return {
    id: s.id, name: s.name, en: s.en, aliases: s.aliases,
    kind: s.kind, identity: s.identity, year: s.year, era: s.era,
    fit: s.fit, daily: s.fit === '高', contexts: s.contexts,
    summary: s.summary, visual: s.visual, dont: s.dont,
    palettes: s.palettes.map(p => ({ id: paletteId(p), name: p.name, colors: p.colors.slice(0, 4) })),
    detail: `styles/${s.id}.json`, default_pack: `packs/${s.id}.md`
  };
}

export function styleDocument(s) {
  return {
    ...metadata(), ...styleSummary(s), history: s.history,
    related: s.related.map(([id, relationship]) => ({ id, relationship })),
    sources: s.refs.map(id => ({ id, title: sources[id][0], url: sources[id][1] })),
    palettes: s.palettes.map(p => ({
      id: paletteId(p), name: p.name, note: p.note,
      roles: rolesFor(p), contrast_checks: checksFor(p),
      variants: Object.fromEntries(Object.keys(chartModes).map(mode => [mode, {
        css: paletteCSS(p, mode), prompt: makePrompt(s, p, mode), complete_pack: completePack(s, p, mode)
      }]))
    }))
  };
}

export function createIndex() {
  return { ...metadata(), count: styles.length, kinds, contexts, chart_modes: chartModes,
    selection_guide: selectionGuide, catalog: 'catalog.json',
    styles: styles.map(styleSummary) };
}

export function createCatalog() {
  return { ...metadata(), count: styles.length, kinds, contexts, chart_modes: chartModes,
    selection_guide: selectionGuide, common_rules: commonRules,
    common_sources: ['carbon','color','charts','wcag'].map(id => ({ id, title: sources[id][0], url: sources[id][1] })),
    styles: styles.map(styleDocument) };
}

export function createAIText() {
  return `# Presentation Atlas — AI 选型资料\n\n${selectionGuide.map((s, i) => `${i + 1}. ${s}`).join('\n')}\n\n完整 JSON：api/v1/catalog.json（两套配色与三类图表的所有组合）。\n下文每项仅为第一套配色＋分类图表；其他组合请读取 JSON 或使用 atlas.py show。\n\n${styles.map(s => `<!-- style_id: ${s.id}; palette_id: ${paletteId(s.palettes[0])}; chart: categorical -->\n${completePack(s, s.palettes[0])}`).join('\n---\n\n')}`;
}

export function aiHandoff(base = '') {
  const path = base ? `${base.replace(/\/$/, '')}/api/v1/` : 'api/v1/';
  return `请用 Presentation Atlas 为后续演示选择设计方案。先读取 ${path}index.json，再读取候选的 styles/{id}.json；也可以读取随附的 catalog.json 或 llms-full.txt。\n\n${selectionGuide.map((s, i) => `${i + 1}. ${s}`).join('\n')}\n\n请在收到我的具体主题与目的后再选型。若无法访问以上路径，请让我提供 catalog.json／llms-full.txt；不要假装已经读取。可访问本地文件与命令行的 AI 可以执行：python3 atlas.py search --context academic --daily；python3 atlas.py show swiss --palette cobalt-grid --chart diverging --format pack。`;
}
