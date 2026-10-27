import palettes from './palettes.json' with { type: 'json' };
import { entries, kinds, sources } from './catalog.js';
export { kinds, sources };

const oldNames = { swiss: ['国际主义版式'], editorial: ['现代编辑设计'], minimal: ['极简主义', 'Minimalism'], technical: ['技术单色','Technical Monochrome'], risograph: ['孔版印刷'], postmodern: ['后现代主义'], y2k: ['千禧年风格'], 'retro-futurism': ['复古未来主义'], cyberpunk: ['赛博朋克霓虹'] };
const contextOverrides = { bauhaus:['技术分享','课程教学','设计史'], constructivism:['学术报告','课程教学','设计史'], destijl:['技术分享','课程教学','设计史'], 'neo-brutalism':['技术分享','课程教学'], 'organic-design':['学术报告','课程教学','设计史'], 'web-brutalism':['技术分享','课程教学','设计史'], cyberpunk:['技术分享','设计史'], y2k:['技术分享','课程教学','设计史'] };
export const styles = entries.map(s => ({ ...s, contexts:contextOverrides[s.id] || s.contexts, aliases: [...(s.aliases || []), ...(oldNames[s.id] || [])], palettes: palettes[s.paletteLike || s.id].map(p => ({
  ...p, note: '为 HTML 演示改编的灵感配色；非历史标准色。'
})) }));
export const chartModes = { categorical: '分类 · 不同组别', sequential: '顺序 · 强弱程度', diverging: '发散 · 相对零点' };
export const commonRules = [
  '本项目的演示改编：以1280×720、16:9为逻辑画布；正文从32px、图表标注从24px、标题从56—96px起调。信息区约留6%安全边距；按实际屏幕与投影距离复核，不把逻辑字号视为可读性保证。',
  '中文采用系统黑体／思源黑体，衬线展示可用宋体；英文按风格选择无衬线、衬线或等宽字体。字体须有可用回退；保持自然中文标点与字距。',
  '一页一个主要论点；结论、证据、限制条件和来源有明确层级。图表使用真实单位、一致刻度、直接标签和不确定性说明。',
  '借鉴Carbon：颜色按用途命名；分类、顺序、发散数据采用不同色系；用文字、形状或线型补充颜色。图表配色独立于装饰色，不能任意把强调色当警告色。图表色值参考Carbon色卡并按项目抽样与组合，不宣称每套均为官方完整调色板；发散色标以零点为中性中心，示例条形图用方向和长度表达幅度。',
  '正文与数据置于不透明稳定表面。普通文本前景／背景参考4.5:1；大文本在符合实际尺寸条件时参考3:1；必要控件边界／状态参考3:1。透明、图片和渐变要检查实际合成区域；这些规则不是完整WCAG认证。',
  '界面可用键盘操作并保留可见焦点；尊重prefers-reduced-motion；动画仅用于引导与反馈。视频提供控制、字幕或文字替代，不自动播放声音；交互须有说明、重置与静态讲解路径。'
];

const rgb = hex => hex.replace('#', '').match(/../g).map(x => parseInt(x, 16));
export function luminance(hex) { return rgb(hex).map(x => x / 255).map(x => x <= .04045 ? x / 12.92 : ((x + .055) / 1.055) ** 2.4).reduce((sum, x, i) => sum + x * [.2126, .7152, .0722][i], 0); }
export function contrast(a, b) { const [x, y] = [luminance(a), luminance(b)].sort((a, b) => b - a); return (x + .05) / (y + .05); }
export function mix(a, b, t) { return '#' + rgb(a).map((x, i) => Math.round(x * (1 - t) + rgb(b)[i] * t).toString(16).padStart(2, '0')).join(''); }

export function rolesFor(palette, neutral = false) {
  const [background, text, accent, secondary] = neutral ? ['#f7f7f2', '#161616', '#555555', '#999999'] : palette.colors;
  const dark = luminance(background) < .18;
  return { background, surface: mix(background, text, .035), text, textSecondary: mix(text, background, .23),
    accent, secondary, border: mix(text, background, .36), accentText: contrast(accent, background) >= 4.5 ? accent : text,
    onAccent: contrast(accent, '#000000') >= contrast(accent, '#ffffff') ? '#000000' : '#ffffff',
    statusSuccess: dark ? '#6fdc8c' : '#198038', statusWarning: dark ? '#f1c21b' : '#8e6a00', statusError: dark ? '#ff8389' : '#da1e28',
    categorical: neutral ? ['#333333', '#707070', '#999999'] : dark ? ['#be95ff', '#33b1ff', '#3ddbd9'] : ['#6929c4', '#1192e8', '#005d5d'],
    sequential: neutral ? ['#dddddd', '#999999', '#333333'] : dark ? ['#00539a', '#1192e8', '#bae6ff'] : ['#a6c8ff', '#4589ff', '#002d9c'],
    diverging: neutral ? ['#555555', '#eeeeee', '#999999'] : dark ? ['#ff8389', '#393939', '#3ddbd9'] : ['#a2191f', '#f4f4f4', '#007d79'] };
}
export function cssVars(palette, neutral = false) {
  return Object.entries(rolesFor(palette, neutral)).flatMap(([key, value]) => Array.isArray(value) ? value.map((v, i) => `--${key}-${i + 1}:${v}`) : [`--${key.replace(/[A-Z]/g, x => '-' + x.toLowerCase())}:${value}`]).join(';');
}
export function paletteCSS(palette, mode = 'categorical') {
  const r = rolesFor(palette);
  return `/* ${palette.name} · 演示改编；图表：${chartModes[mode]} */\n:root {\n${Object.entries(r).filter(([, v]) => !Array.isArray(v)).map(([key, v]) => `  --${key.replace(/[A-Z]/g, x => '-' + x.toLowerCase())}: ${v};`).join('\n')}\n${r[mode].map((v, i) => `  --chart-${i + 1}: ${v};`).join('\n')}\n}`;
}
export function checksFor(palette) {
  const r = rolesFor(palette);
  return [
    ['正文／背景', r.text, r.background, 4.5], ['次要文字／背景', r.textSecondary, r.background, 4.5],
    ['正文／表面', r.text, r.surface, 4.5], [r.accentText === r.accent ? '强调文字／背景' : '强调文字／背景（改用正文色）', r.accentText, r.background, 4.5],
    ['强调面板上的文字', r.onAccent, r.accent, 4.5], ['边界／背景', r.border, r.background, 3]
  ].map(([label, fg, bg, threshold]) => ({ label, fg, bg, threshold, ratio: contrast(fg, bg), pass: contrast(fg, bg) >= threshold }));
}
const sourceLines = s => s.refs.map(key => `- ${sources[key][0]}：${sources[key][1]}`).join('\n');
export function makePrompt(style, palette, mode = 'categorical') {
  return `请制作中文 reveal.js 学术／技术演示，采用“${style.name}”（${style.en}）。\n${style.fit === '低' ? '此方案优先用于封面或章节；证据页降低装饰密度，保持同一字体与对齐体系。\n' : ''}视觉规则：${style.visual.join(' ')}\n避免：${style.dont}\n所选配色：${palette.name}。\n${paletteCSS(palette, mode)}\n图表类型：${chartModes[mode]}；配合直接标签与数值，不仅依赖色相。\n${commonRules.join('\n')}\n风格是有边界的演示转译，不要将本项目改编配色当作历史标准；不要仅给同一版式换色。`;
}
export function completePack(style, palette, mode = 'categorical') {
  return `# ${style.name} / ${style.en}\n\n## 历史定位\n${kinds[style.kind]} · ${style.identity}\n${style.era}\n适合场景：${style.contexts.join('、')}；日常适配：${style.fit}（项目评估）。\n${style.history}\n\n## 风格指南\n${style.visual.map((v, i) => `${i + 1}. ${v}`).join('\n')}\n避免：${style.dont}\n关系：${style.related.map(([id, rel]) => `${styles.find(s => s.id === id).name}（${rel}）`).join('；') || '无单一谱系归属'}\n\n## 所选配色\n${palette.note}\n${paletteCSS(palette, mode)}\n\n## 组合对比度\n${checksFor(palette).map(c => `- ${c.label}：${c.fg} / ${c.bg} = ${c.ratio.toFixed(2)}:1；参考${c.threshold}:1，${c.pass ? '达到' : '未达到'}。`).join('\n')}\n仅覆盖列出的实色组合；装饰叠色、透明、图像、实际渲染字号和投影条件仍需检查。\n\n## 演示共通规则（本项目改编）\n${commonRules.map(x => '- ' + x).join('\n')}\n\n## 可直接使用的提示词\n${makePrompt(style, palette, mode)}\n\n## 来源与边界\n${sourceLines(style)}\n- Carbon颜色与数据规范：${sources.color[1]}；${sources.charts[1]}\n- W3C对比度：${sources.wcag[1]}\n核对日期：2026-10-23。历史年份为浏览锚点，非统一发明年；趋势类来源为实践或作者说明。\n`;
}
