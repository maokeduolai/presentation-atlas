import Reveal from 'reveal.js';
import 'reveal.js/dist/reveal.css';
import { styles, kinds, sources, chartModes, rolesFor, checksFor, makePrompt, completePack, paletteCSS, commonRules } from './styles.js';
import { renderSlide, esc } from './slides.js';
import { createCatalog, createAIText, aiHandoff } from './ai-data.js';
import './style.css';
import './specimens.css';

const $ = s => document.querySelector(s);
let selected = styles[0], paletteIndex = 0, mode = 'categorical', neutral = false, deck, page = 0;
let view = 'grid', sort = 'recommended';
const filter = { query: '', kind: 'all', context: 'all', daily: false };
const link = key => `<a href="${sources[key][1]}" target="_blank" rel="noreferrer">${esc(sources[key][0])} ↗</a>`;
const fitLabel = s => s.fit === '高' ? '日常优先' : s.fit === '中' ? '按内容选用' : '章节／历史备选';

$('#app').innerHTML = `
  <header class="topbar" id="top"><a class="brand" href="#top"><span class="brand-mark" aria-hidden="true">a<span>↗</span></span><span><b>演示设计图谱</b><small>PRESENTATION ATLAS</small></span></a><nav aria-label="主导航"><a href="#collection">风格库</a><a href="#foundations">设计基础</a><a href="#access">AI / 离线</a></nav><span class="framework">HTML / reveal.js</span></header>
  <main><section class="hero"><div class="hero-copy"><p class="eyebrow">FORM FOLLOWS KNOWLEDGE / 01—30</p><h1>同一个观点，<br>不同的<span>视觉语言。</span></h1><p class="hero-intro">为学术报告与技术分享，找到有依据的设计方法。<br>从构图、字体到配色，把风格变成可执行的规则。</p><a class="button primary" href="#collection">探索 30 种设计语言 <span>↓</span></a><p class="hero-note">共同内容 · 独立构图 · 两套改编配色 · 可复制提示词</p></div><div class="hero-studies" aria-label="三种形式语言比较">${['swiss','constructivism','memphis'].map((id, i) => { const s = styles.find(x => x.id === id); return `<button class="study study-${i}" data-open="${id}" aria-label="查看${s.name}">${renderSlide(s, s.palettes[0], 0, { interactive: false })}<span>${String(i + 1).padStart(2,'0')} / ${s.name} ↗</span></button>`; }).join('')}</div></section>
  <section class="intro-strip" aria-label="使用步骤"><div><b>01</b><p><strong>先看形式</strong><span>比较同一内容如何被组织，而不只看颜色。</span></p></div><div><b>02</b><p><strong>理解出处</strong><span>分清历史运动、设计方法与当代应用。</span></p></div><div><b>03</b><p><strong>带走规则</strong><span>复制当前风格、配色与 reveal.js 提示词。</span></p></div></section>
  <section class="library" id="collection"><aside class="filters"><p class="eyebrow">EXPLORE THE ATLAS</p><label class="search-label" for="search">检索设计语言</label><div class="search-box"><span aria-hidden="true">⌕</span><input id="search" type="search" placeholder="名称、年代、构图、旧称…" autocomplete="off"><kbd>/</kbd></div><label class="filter-label" for="kind">历史身份</label><select id="kind"><option value="all">全部身份</option>${Object.entries(kinds).map(([v,l]) => `<option value="${v}">${l}</option>`).join('')}</select><label class="filter-label" for="context">使用场景</label><select id="context"><option value="all">全部场景</option>${['学术报告','技术分享','课程教学','设计史'].map(x => `<option>${x}</option>`).join('')}</select><label class="check-filter"><input type="checkbox" id="daily"> 只看日常优先</label><button class="text-button clear-filter" id="clear">重置筛选 ↺</button><div class="filter-note"><span>关于“风格”</span><p>这些条目并非同一层级的流派。身份与用途分别标记；相近形式可能有真实的历史联系。</p></div><div class="filter-note"><span>关于“预览”</span><p>这是有边界的演示转译。配色为项目改编，不宣称复原历史标准色。</p></div></aside>
  <div class="collection"><div class="collection-head"><div><p class="eyebrow">A REFERENCE, NOT A UNIFORM</p><h2>选择你的表达方式</h2></div><span id="count" role="status" aria-live="polite"></span></div><div class="collection-tools"><div class="segmented" aria-label="浏览方式"><button data-view="grid" aria-pressed="true">视觉卡片</button><button data-view="timeline" aria-pressed="false">时间脉络</button></div><label class="sort-label">排序 <select id="sort"><option value="recommended">日常推荐优先</option><option value="chronological">按历史时间</option></select></label></div><p class="timeline-note" id="timeline-note" hidden>年份是浏览锚点。展开查看具体时期、边界与关系；无单一起源的预设和集合标签列于末尾。</p><div id="results" class="style-grid"></div><div id="empty" class="empty" hidden><h3>没有匹配的条目</h3><p>试试更短的关键词，或重置筛选。</p></div></div></section>
  <section class="foundations" id="foundations"><div><p class="eyebrow">SHARED FOUNDATIONS / DISTINCT VOICES</p><h2>共用质量规范，<br>保留各自的声音。</h2><p>选择性借鉴 IBM Carbon 的设计方法。Carbon 是产品设计系统，不是历史流派，也不是演示规范；字号与画布规则由本项目另作改编。</p><a href="${sources.carbon[1]}" target="_blank" rel="noreferrer">了解 Carbon Design System ↗</a></div><div class="foundation-grid"><article><span>01 / STRUCTURE</span><h3>稳定的层级与节奏</h3><p>工具界面使用一致的间距、按钮主次与焦点状态。演示可以表达不同构图，正文仍保持清楚。</p><div>${link('spacing')} ${link('typography')}</div></article><article><span>02 / COLOR ROLES</span><h3>颜色先有用途</h3><p>背景、表面、文字、边界和强调各司其职。图表使用独立的分类、顺序或发散色系，并配直接标签。</p><div>${link('color')} ${link('charts')}</div></article><article><span>03 / ACCESSIBILITY</span><h3>可测量，也有边界</h3><p>每套配色显示实色组合对比度。透明、图片、实际字号和投影条件需继续检查；不据此宣称完整合规。</p><div>${link('wcag')} ${link('motion')}</div></article><article><span>04 / TRANSLATION</span><h3>从史实到演示</h3><p>历史身份、应用适配和视觉规则分别记录。用灰度对照辅助观察结构，接受风格间真实存在的重叠。</p><div><a href="./revision-plan.md" target="_blank">阅读修改记录 ↗</a></div></article></div></section>
  <section class="access" id="access" aria-labelledby="access-title"><div class="access-intro"><p class="eyebrow">TAKE THE ATLAS WITH YOU</p><h2 id="access-title">让 AI 读懂风格，<br>让工具随你移动。</h2><p>网页、机器数据与提示词共用同一份资料。先让 AI 理解内容与目的，再比较候选的形式语言。</p></div><div class="access-grid"><article><span class="eyebrow">01 / FOR YOUR AI</span><h3>把选型依据交给 AI</h3><p>完整 JSON 含历史边界、指南、两套配色与三类图表的所有提示词。文本版采用每项第一套配色与分类图表。</p><div class="access-actions"><button class="button primary" data-copy-ai>复制 AI 使用说明</button><button class="button secondary" data-export="catalog">下载完整 JSON</button><button class="text-button" data-export="text">下载文本资料 .txt ↓</button></div><details><summary>查询方式与示例</summary><p>有本机工具能力的 AI 可在 ZIP 解压目录执行：</p><pre>python3 atlas.py search --context academic --daily
python3 atlas.py show swiss --palette cobalt-grid --chart diverging --format pack</pre><p>或运行 <code>python3 atlas.py serve</code> 后读取：</p><pre>/api/v1/styles?context=academic&amp;daily=true
/api/v1/styles/swiss?palette=cobalt-grid&amp;chart=diverging</pre><p>文字检索与场景筛选辅助选型，具体理由由 AI 结合内容给出。远程聊天 AI 请附上下载的 JSON／TXT；它无法直接读取你电脑的 localhost。静态部署仅提供文件接口。</p><a href="./AI-GUIDE.md" target="_blank">完整接口说明 ↗</a> · <a href="./llms.txt" target="_blank">llms.txt ↗</a></details></article><article><span class="eyebrow">02 / ON ANY DESK</span><h3>解压后，直接打开</h3><p>便携包包含单文件网页、AI 资料、查询工具和使用说明。浏览、换色与导出无需联网或安装 Node.js。</p><div class="access-actions"><a class="button primary" href="./presentation-atlas-portable.zip" download data-package>下载离线 ZIP ↓</a><button class="button secondary" data-save-html>保存单文件 HTML ↓</button></div><p class="portable-note" data-portable-note hidden>你正在使用单文件版。保存 HTML 即可继续移动；机器数据、CLI 与文档请保留 ZIP 内的完整目录。</p><details><summary>离线使用说明</summary><ol><li>先解压 ZIP，用现代浏览器打开其中的 <code>index.html</code>。</li><li>单文件 HTML 包含全部运行代码与风格数据；也可在本页导出 AI 资料。</li><li>来源链接需要联网。可选 CLI／HTTP 需要 Python 3.9+，无额外依赖；Windows 可用 <code>py -3 atlas.py</code>。</li></ol><p>系统字体可能略有差异。手机的文件预览器可能限制脚本；请使用支持本地 HTML 的浏览器。剪贴板受限时，可展开文本或下载完整包。</p></details></article></div></section>
  <footer><b>演示设计图谱 / PRESENTATION ATLAS</b><p>30 个条目 · 每项两套改编配色 · 来源核对于 2026-10-23</p><span>为知识表达而设计。</span></footer></main>
  <dialog id="detail" aria-labelledby="detail-title"><div class="dialog-bar"><span>DESIGN LANGUAGE / <b id="detail-counter"></b></span><button class="close-button" id="close" aria-label="关闭详情">关闭 <span>×</span></button></div><div class="dialog-scroll" id="detail-body"></div><div class="copy-bar"><span>带走当前选择<span id="selection-note"></span></span><div><button class="button secondary" data-copy="prompt">复制提示词</button><button class="button primary" data-copy="pack">复制完整风格包 ↗</button></div></div></dialog><div id="toast" role="status" aria-live="polite"></div>`;

function getVisible() {
  const q = filter.query.trim().toLowerCase();
  const items = styles.filter(s => (filter.kind === 'all' || s.kind === filter.kind) && (filter.context === 'all' || s.contexts.includes(filter.context)) && (!filter.daily || s.fit === '高') && (!q || [s.name,s.en,s.era,s.identity,s.summary,s.history,...s.visual,...(s.aliases || [])].join(' ').toLowerCase().includes(q)));
  if (view === 'timeline' || sort === 'chronological') items.sort((a,b) => (a.year ?? 9999) - (b.year ?? 9999));
  else items.sort((a,b) => ({高:0,中:1,低:2}[a.fit]) - ({高:0,中:1,低:2}[b.fit]));
  return items;
}
function renderResults() {
  const items = getVisible();
  $('#count').textContent = `${items.length} / ${styles.length} 个条目`;
  $('#results').className = view === 'timeline' ? 'timeline' : 'style-grid';
  $('#timeline-note').hidden = view !== 'timeline';
  $('#empty').hidden = items.length !== 0;
  $('#results').innerHTML = items.map(s => `<article class="style-card ${view === 'timeline' ? 'timeline-card' : ''}">${view === 'timeline' ? `<div class="time-anchor"><b>${s.year ? '约 ' + s.year : '无单一年份'}</b><span>${esc(s.identity)}</span></div>` : ''}<button class="preview-button" data-open="${s.id}" aria-label="预览${s.name}">${renderSlide(s,s.palettes[0],0,{interactive:false})}<span class="open-cue">查看形式语言 ↗</span></button><div class="card-info"><div class="card-meta"><span>${kinds[s.kind]}</span><b class="fit fit-${s.fit}">${fitLabel(s)}</b></div><h3><button data-open="${s.id}">${esc(s.name)} <span>↗</span></button></h3><p class="en">${esc(s.en)}</p><p class="card-summary">${esc(s.summary)}</p><div class="card-bottom"><span>${s.year ? `约 ${s.year} 起 / 浏览锚点` : '应用预设／回顾性集合'}</span><span class="swatches" aria-label="第一套配色">${s.palettes[0].colors.slice(0,4).map(c => `<i style="background:${c}"></i>`).join('')}</span></div>${view === 'timeline' ? `<p class="timeline-history">${esc(s.history)}</p><div class="timeline-relations">${s.related.map(([id,rel]) => `<button class="relation" data-open="${id}">${styles.find(x=>x.id===id).name} → ${rel}</button>`).join('')}</div>` : ''}</div></article>`).join('');
}

function detailHTML(s) {
  return `<header class="detail-head"><p class="eyebrow">${kinds[s.kind]} / ${esc(s.identity)}</p><h2 id="detail-title">${esc(s.name)}</h2><p class="detail-en">${esc(s.en)}</p><p class="detail-summary">${esc(s.summary)}</p><div class="detail-tags"><span class="fit fit-${s.fit}">${fitLabel(s)}</span><span>${esc(s.era)}</span></div></header>
  <div class="preview-grid"><section class="preview-block" aria-label="演示预览"><div class="preview-toolbar"><div><b>形式语言预览</b><small>共同样例 · 四类页面</small></div><div><label class="gray-toggle"><input type="checkbox" id="gray"> 灰度对照</label><button class="text-button" id="enlarge" aria-pressed="false">放大 ↗</button></div></div><div class="preview-frame" tabindex="0" role="group" aria-label="reveal.js幻灯片，使用左右方向键翻页"><div class="reveal" id="deck"><div class="slides" id="slides"></div></div></div><div class="slide-controls"><div class="page-tabs">${['标题','方法','图表','媒体'].map((p,i)=>`<button data-page="${i}" aria-pressed="${i===0}"><span>0${i+1}</span> ${p}</button>`).join('')}</div><div class="arrows"><button id="prev" aria-label="上一页">←</button><span id="page-count">01 / 04</span><button id="next" aria-label="下一页">→</button></div></div><div class="chart-mode"><label for="chart-mode">数据配色</label><select id="chart-mode">${Object.entries(chartModes).map(([v,l])=>`<option value="${v}">${l}</option>`).join('')}</select><span id="gray-note">图表采用独立数据色系</span></div><p class="preview-caption">${esc(s.visual[0])} ${esc(s.visual[1])}</p></section>
  <aside class="palette-block"><p class="eyebrow">PALETTE / SEMANTIC ROLES</p><h3>选择一套配色</h3><div class="palette-tabs">${s.palettes.map((p,i)=>`<button data-palette="${i}" aria-pressed="${i===0}"><span>${p.colors.slice(0,4).map(c=>`<i style="background:${c}"></i>`).join('')}</span><b>${esc(p.name)}</b><small>方案 0${i+1}</small></button>`).join('')}</div><p class="palette-disclaimer">为 HTML 演示改编的灵感配色，非历史标准色。</p><div id="role-list"></div><button class="text-button" data-copy="palette">复制当前配色变量 ↗</button></aside></div>
  <div class="detail-columns"><section class="guide"><p class="eyebrow">01 / FORM LANGUAGE</p><h3>风格指南</h3><ol>${s.visual.map((v,i)=>`<li><span>${['构图','文字','图像与数据','装饰与材料'][i]}</span><p>${esc(v)}</p></li>`).join('')}</ol><p class="avoid"><b>避免</b>${esc(s.dont)}</p></section><section class="history-block"><p class="eyebrow">02 / HISTORY & CONTEXT</p><h3>历史定位与边界</h3><p>${esc(s.history)}</p><div class="relations">${s.related.map(([id,rel])=>`<button class="relation" data-open="${id}"><b>${styles.find(x=>x.id===id).name} ↗</b><span>${esc(rel)}</span></button>`).join('')}</div><details><summary>查看来源与核对说明</summary><ul>${s.refs.map(k=>`<li>${link(k)}</li>`).join('')}</ul><p>核对于2026-10-23。年份为浏览锚点；应用预设不设虚构起源。界面趋势的作者说明与实践例库用于界定用法，不作为公认起源的证明。预览是选择性转译。</p></details></section></div>
  <section class="contrast-section"><div><p class="eyebrow">03 / MEASURED COMBINATIONS</p><h3>实色组合对比度</h3><p>只报告右列明确的前景／背景组合。透明、叠色、图片及实际渲染字号需另查，投影环境也需现场复核。灰度对照不改变这里与复制包的所选配色。</p><p>${link('wcag')} ${link('accessibility')}</p></div><div id="contrast-results"></div></section>
  <details class="common-rules"><summary>演示共通规则 · Carbon 方法与本项目改编</summary><ul>${commonRules.map(r=>`<li>${esc(r)}</li>`).join('')}</ul><p>${['grid','spacing','typography','color','charts','motion'].map(link).join(' · ')}</p></details>
  <section class="prompt-section"><div><p class="eyebrow">04 / MAKE IT YOURS</p><h3>复制后，交给你的内容。</h3><p>提示词会带入当前风格、所选配色和数据类型。完整包另含历史定位、来源、风格指南与组合实测结果。</p></div><details><summary>查看当前提示词</summary><pre id="prompt-text"></pre></details><details><summary>查看完整包</summary><pre id="pack-text"></pre></details><button class="text-button" data-download>下载完整包 .md ↓</button></section>`;
}

async function openStyle(s) {
  if (!s) return;
  if (deck) { deck.destroy(); deck = null; }
  selected = s; paletteIndex = 0; mode = 'categorical'; neutral = false; page = 0;
  $('#detail-body').innerHTML = detailHTML(s);
  $('#detail-counter').textContent = `${String(styles.indexOf(s)+1).padStart(2,'0')} / ${styles.length}`;
  $('#detail').classList.remove('expanded');
  if (!$('#detail').open) $('#detail').showModal();
  document.body.classList.add('modal-open');
  $('#detail-body').scrollTop = 0;
  updatePalette();
  buildSlides();
  const instance = new Reveal($('#deck'), { embedded:true, controls:false, progress:false, center:false, hash:false, keyboard:false, touch:true, width:1280, height:720, margin:0, minScale:.1, maxScale:2, transition:matchMedia('(prefers-reduced-motion: reduce)').matches ? 'none' : 'fade' });
  deck = instance;
  await instance.initialize();
  if (deck !== instance) return;
  instance.on('slidechanged', e => { page=e.indexh; updatePage(); });
  updatePage();
  $('#close').focus();
}
function buildSlides() {
  $('#slides').innerHTML = [0,1,2,3].map(i=>`<section>${renderSlide(selected,selected.palettes[paletteIndex],i,{neutral,mode})}</section>`).join('');
  if (deck) { deck.sync(); deck.slide(page); deck.layout(); }
}
function updatePage() {
  document.querySelectorAll('[data-page]').forEach(b=>b.setAttribute('aria-pressed',String(+b.dataset.page===page)));
  $('#page-count').textContent=`0${page+1} / 04`;
  $('#prev').disabled=page===0; $('#next').disabled=page===3;
}
function updatePalette() {
  const p=selected.palettes[paletteIndex], r=rolesFor(p);
  const names = { background:'背景',surface:'表面',text:'正文',textSecondary:'次要文字',accent:'装饰强调',accentText:'强调文字',secondary:'辅助装饰',border:'边界',onAccent:'强调面文字' };
  $('#role-list').innerHTML=Object.entries(names).map(([key,label])=>`<div class="role-row"><i style="background:${r[key]}"></i><span>${label}</span><code>${r[key].toUpperCase()}</code></div>`).join('')+`<details class="status-roles"><summary>状态角色与用途</summary>${[['成功','statusSuccess'],['警告','statusWarning'],['错误','statusError']].map(([label,key])=>`<div class="role-row"><i style="background:${r[key]}"></i><span>${label}</span><code>${r[key].toUpperCase()}</code></div>`).join('')}<p>与文字／图标共同使用；不代替图表系列。这里只预览色值，未测试其作为文字的所有组合。</p></details>`;
  document.querySelectorAll('[data-palette]').forEach(b=>b.setAttribute('aria-pressed',String(+b.dataset.palette===paletteIndex)));
  $('#contrast-results').innerHTML=checksFor(p).map(c=>`<div class="contrast-row"><span><b>${c.label}</b><small>${c.fg} / ${c.bg}</small></span><span><strong>${c.ratio.toFixed(2)}:1</strong><small class="${c.pass?'pass':'fail'}">${c.pass?'达到':'待调整'} ${c.threshold}:1</small></span></div>`).join('');
  let legend=$('#chart-colors');
  if(!legend){legend=document.createElement('div');legend.id='chart-colors';legend.className='chart-colors';$('.chart-mode').after(legend);}
  const labels=mode==='categorical'?['组别 A','组别 B','组别 C']:mode==='sequential'?['低 <40','中 40—69','高 ≥70']:['负向','零点','正向'];
  legend.innerHTML=`<span>导出色系 · 项目抽样</span>${r[mode].map((c,i)=>`<span><i style="background:${c}"></i>${labels[i]} <code>${c}</code></span>`).join('')}`;
  $('#prompt-text').textContent=makePrompt(selected,p,mode);
  $('#pack-text').textContent=completePack(selected,p,mode);
  $('#selection-note').textContent=`${selected.name} · ${p.name} · ${chartModes[mode].split(' · ')[0]}`;
}
function closeDetail() { $('#detail').close(); }
$('#detail').addEventListener('close',()=>{ if(deck){deck.destroy();deck=null;} document.body.classList.remove('modal-open'); });
$('#close').addEventListener('click',closeDetail);
$('#detail').addEventListener('click',e=>{if(e.target===$('#detail')){const r=$('#detail').getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)closeDetail();}});

document.addEventListener('click',e=>{
  const opener=e.target.closest('[data-open]'); if(opener) {openStyle(styles.find(s=>s.id===opener.dataset.open));return;}
  const viewBtn=e.target.closest('[data-view]'); if(viewBtn){view=viewBtn.dataset.view;document.querySelectorAll('[data-view]').forEach(b=>b.setAttribute('aria-pressed',String(b===viewBtn)));$('#sort').disabled=view==='timeline';$('#sort').value=view==='timeline'?'chronological':sort;renderResults();return;}
  const p=e.target.closest('[data-palette]'); if(p){paletteIndex=+p.dataset.palette;updatePalette();buildSlides();return;}
  const tab=e.target.closest('[data-page]');if(tab){page=+tab.dataset.page;deck?.slide(page);updatePage();return;}
  if(e.target.closest('#prev')){deck?.prev();return;}if(e.target.closest('#next')){deck?.next();return;}
  if(e.target.closest('#enlarge')){const expanded=$('#detail').classList.toggle('expanded');$('#enlarge').setAttribute('aria-pressed',String(expanded));$('#enlarge').textContent=expanded?'恢复大小 ↙':'放大 ↗';requestAnimationFrame(()=>deck?.layout());return;}
  if(e.target.closest('.demo-reset')){const panel=e.target.closest('.demo-panel');panel.querySelector('input').value=50;panel.querySelector('output').value='50%';panel.querySelector('.demo-items').style.setProperty('--hint',.5);return;}
  const copy=e.target.closest('[data-copy]');if(copy)copyText(copy.dataset.copy);
  if(e.target.closest('[data-copy-ai]')){const base=/^https?:$/.test(location.protocol)?new URL('.',location.href).href:'';copyValue(aiHandoff(base));return;}
  const exportButton=e.target.closest('[data-export]');if(exportButton){const isJSON=exportButton.dataset.export==='catalog';downloadFile(isJSON?JSON.stringify(createCatalog(),null,2)+'\n':createAIText(),isJSON?'catalog.json':'llms-full.txt',isJSON?'application/json':'text/plain');return;}
  if(e.target.closest('[data-save-html]')){saveHTML();return;}
  if(e.target.closest('[data-download]')){const blob=new Blob([completePack(selected,selected.palettes[paletteIndex],mode)],{type:'text/markdown;charset=utf-8'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=`${selected.id}-${selected.palettes[paletteIndex].name.replaceAll(' ','-')}.md`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
});
$('#detail').addEventListener('input',e=>{if(e.target.matches('input[type=range]')){const panel=e.target.closest('.demo-panel');panel.querySelector('output').value=e.target.value+'%';panel.querySelector('.demo-items').style.setProperty('--hint',e.target.value/100);}});
$('#detail').addEventListener('change',e=>{
  if(e.target.id==='gray'){neutral=e.target.checked;$('#gray-note').textContent=neutral?'灰度仅用于结构比较；复制仍采用所选配色':'图表采用独立数据色系';buildSlides();}
  if(e.target.id==='chart-mode'){mode=e.target.value;page=2;updatePalette();buildSlides();updatePage();}
});
$('#detail').addEventListener('keydown',e=>{
  if(e.key==='Tab'){
    const targets=[...$('#detail').querySelectorAll('button:not(:disabled),a[href],input:not(:disabled),select:not(:disabled),textarea:not(:disabled),summary,[tabindex="0"]')].filter(el=>el.getClientRects().length&&getComputedStyle(el).visibility!=='hidden');
    const first=targets[0],last=targets[targets.length-1];
    if(e.shiftKey&&document.activeElement===first){e.preventDefault();last?.focus();}
    else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus();}
  }
  if(e.target.closest('.preview-frame')&&!e.target.matches('input,button,select')&&['ArrowLeft','ArrowRight'].includes(e.key)){e.preventDefault();e.key==='ArrowRight'?deck?.next():deck?.prev();}
});
$('#search').addEventListener('input',e=>{filter.query=e.target.value;renderResults();});
$('#kind').addEventListener('change',e=>{filter.kind=e.target.value;renderResults();});
$('#context').addEventListener('change',e=>{filter.context=e.target.value;renderResults();});
$('#daily').addEventListener('change',e=>{filter.daily=e.target.checked;renderResults();});
$('#sort').addEventListener('change',e=>{sort=e.target.value;renderResults();});
$('#clear').addEventListener('click',()=>{Object.assign(filter,{query:'',kind:'all',context:'all',daily:false});$('#search').value='';$('#kind').value='all';$('#context').value='all';$('#daily').checked=false;renderResults();});
document.addEventListener('keydown',e=>{if(e.key==='/'&&!$('#detail').open&&!e.target.matches('input,textarea,select')){e.preventDefault();$('#search').focus();}});

async function copyText(type) {
  const p=selected.palettes[paletteIndex];const text=type==='pack'?completePack(selected,p,mode):type==='prompt'?makePrompt(selected,p,mode):paletteCSS(p,mode);
  await copyValue(text,neutral?'已复制当前选择（所选彩色配色）':'已复制当前选择');
}
async function copyValue(text,success='已复制 AI 使用说明') {
  const previous=document.activeElement;
  let ok=false;
  try { await navigator.clipboard.writeText(text);ok=true; } catch {
    const box=document.createElement('textarea');box.value=text;box.className='copy-fallback';($('#detail').open?$('#detail'):document.body).appendChild(box);box.focus();box.select();try{ok=document.execCommand('copy');}catch{}box.remove();if(previous?.isConnected)previous.focus({preventScroll:true});
  }
  showToast(ok?success:'复制未成功，请使用下载或展开文本后手动复制。');
}
function showToast(text){($('#detail').open?$('#detail'):document.body).appendChild($('#toast'));$('#toast').textContent=text;$('#toast').classList.add('show');clearTimeout(showToast.timer);showToast.timer=setTimeout(()=>$('#toast').classList.remove('show'),3200);}
function downloadFile(text,name,type){const url=URL.createObjectURL(new Blob([text],{type:type+';charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
function saveHTML(){
  const a=document.createElement('a');a.href='./presentation-atlas-offline.html';a.download='presentation-atlas-offline.html';a.click();
}
if(document.documentElement.dataset.portable||location.protocol==='file:'){$('[data-package]').hidden=true;$('[data-save-html]').hidden=true;$('[data-portable-note]').hidden=false;}
renderResults();
