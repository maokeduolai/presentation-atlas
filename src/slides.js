import { cssVars, rolesFor } from './styles.js';
export const esc = (s = '') => String(s).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#039;');
let serial = 0;

function artwork(id) {
  const n = ++serial;
  const drawings = {
    swiss: '<path d="M1110 0h90v720h-90z" fill="var(--accent)"/><path d="M70 620h940" class="line"/><text x="790" y="500" class="big-number">01</text>',
    'academic-modern': '<path d="M0 0h1280v28H0z" fill="var(--accent)"/><path d="M900 180v400M70 120h1140" class="line"/><text x="960" y="300" class="big-number">01</text>',
    editorial: '<path d="M70 140h1140M860 180v420M70 635h1140" class="thin"/><text x="920" y="370" class="art-label">FIELD</text><text x="920" y="408" class="art-label">NOTES</text><text x="920" y="505" class="big-number">1.</text>',
    information: '<path d="M820 190h360M820 510h360" class="line"/><g fill="var(--accent)"><rect x="830" y="375" width="70" height="100"/><rect x="945" y="300" width="70" height="175"/><rect x="1060" y="220" width="70" height="255"/></g><path d="M830 280l150-90 150 15" class="thin"/><text x="840" y="580" class="art-label">EVIDENCE → INSIGHT</text>',
    minimal: '<circle cx="640" cy="175" r="8" fill="var(--accent)"/><path d="M590 535h100" class="thin"/>',
    technical: '<path d="M0 70h1280M100 70v580M70 650h1140" class="thin"/><text x="60" y="46" class="art-label">● ● ● / research.md</text><path d="M870 220h230v120H950v130h210" class="signal"/><circle cx="870" cy="220" r="10" fill="var(--accent)"/><circle cx="1160" cy="470" r="10" fill="var(--accent)"/><text x="45" y="245" class="art-label">01</text><text x="45" y="340" class="art-label">02</text><text x="45" y="435" class="art-label">03</text>',
    'east-asian': '<path d="M830 160v400M870 160h270" class="thin"/><ellipse cx="1010" cy="365" rx="85" ry="140" fill="var(--secondary)" opacity=".4"/><path d="M970 235c-70 130 100 140 40 260" class="thin"/>',
    organic: '<path d="M930 110c180-90 365 120 270 350s-320 180-355 40 50-160 20-260 0-90 65-130" fill="var(--secondary)"/><path d="M980 185c-90 100 80 165 0 320m0-200 85-30m-85 110-60 35" class="thin"/>',
    bauhaus: '<circle cx="980" cy="270" r="155" fill="var(--accent)"/><path d="M800 440h300v160H800z" fill="var(--secondary)"/><path d="M1160 190h45v410h-45z" fill="var(--text)"/><path d="M850 510h190" stroke="var(--text)" stroke-width="20"/>',
    constructivism: '<path d="M760 0h520v720h-75L710 190z" fill="var(--accent)"/><path d="m870 0 410 420v170L780 90z" fill="var(--text)"/><circle cx="1010" cy="560" r="95" fill="var(--secondary)"/><path d="m750 660 190-140" stroke="var(--text)" stroke-width="24"/>',
    destijl: '<g stroke="var(--text)" stroke-width="14"><path d="M0 0h1280v720H0z" fill="none"/><path d="M930 0v720M0 565h1280M930 190h350M1120 190v530" fill="none"/><path d="M937 7h336v176H937z" fill="var(--accent)" stroke="none"/><path d="M937 572h176v141H937z" fill="var(--secondary)" stroke="none"/><path d="M1127 197h146v361h-146z" fill="var(--text)" stroke="none"/></g>',
    'new-wave': '<g stroke="var(--accent)" stroke-width="5"><path d="M850 90h360M870 110h340M890 130h320M910 150h300M930 170h280M950 190h260"/></g><path d="m850 270 320-70v300l-320 70z" fill="var(--secondary)"/><text x="890" y="610" class="big-number">↗</text>',
    risograph: `<defs><pattern id="dots${n}" width="9" height="9" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1.3" fill="var(--text)"/></pattern></defs><circle cx="980" cy="290" r="155" fill="var(--accent)" opacity=".7"/><rect x="810" y="325" width="335" height="245" fill="var(--secondary)" opacity=".7"/><circle cx="987" cy="285" r="155" fill="url(#dots${n})" opacity=".35"/><path d="M810 325h335v245H810z" class="thin" transform="translate(7 -6)"/>`,
    'art-deco': '<g fill="none" stroke="var(--accent)" stroke-width="3"><path d="M45 675V140h70V85h70V45h910v40h70v55h70v535z"/><path d="M65 655V160h70v-55h70V65h870v40h70v55h70v495z"/><path d="M480 150 640 75l160 75M530 150l110-75 110 75M585 150l55-75 55 75M640 150V75"/></g>',
    streamline: '<g fill="none" stroke="var(--accent)" stroke-width="12"><path d="M20 140h1000a180 180 0 0 1 0 360H800"/><path d="M20 175h1000a145 145 0 0 1 0 290H850"/><path d="M20 210h1000a110 110 0 0 1 0 220H900"/></g><rect x="870" y="550" width="330" height="60" rx="30" fill="var(--secondary)"/>',
    'pop-art': `<defs><pattern id="pop${n}" width="32" height="32" patternUnits="userSpaceOnUse"><circle cx="8" cy="8" r="5" fill="var(--text)"/></pattern></defs><path d="m910 70 80 90 110-60-5 130 130 30-90 100 90 100-130 30 5 130-110-60-80 90-50-110-110 15 25-120-105-65 105-65-25-120 110 15z" fill="var(--secondary)" stroke="var(--text)" stroke-width="7"/><path d="M930 180h230v320H930z" fill="url(#pop${n})"/>`,
    postmodern: '<path d="M860 580V290a150 150 0 0 1 300 0v290" fill="var(--secondary)" stroke="var(--text)" stroke-width="3"/><path d="m890 155 230 70-55 180-230-70z" fill="var(--accent)"/><path d="M820 600h390M850 620h330" class="line"/>',
    memphis: `<defs><pattern id="mem${n}" width="30" height="30" patternUnits="userSpaceOnUse"><circle cx="8" cy="8" r="4" fill="var(--text)"/></pattern></defs><path d="m910 95 250 80-220 180z" fill="var(--secondary)" stroke="var(--text)" stroke-width="5"/><circle cx="1050" cy="480" r="120" fill="var(--accent)"/><rect x="70" y="565" width="370" height="55" fill="url(#mem${n})"/><path d="m845 415 30-30 30 30 30-30 30 30 30-30 30 30M1030 90l20-25 20 25 20-25 20 25" class="line"/>`,
    cyberpunk: '<path d="M800 140h340l60 60v360l-60 60H800l-40-40V180z" fill="var(--secondary)" opacity=".16"/><path d="M850 200h240v100h-80v140h130M800 530h330v-70" class="signal"/><g fill="var(--accent)"><rect x="830" y="190" width="18" height="18"/><rect x="1120" y="450" width="18" height="18"/></g><path d="M70 95h100M70 95v30M1210 630h-100M1210 630v-30" class="signal"/>',
    y2k: '<ellipse cx="1000" cy="330" rx="270" ry="85" transform="rotate(-40 1000 330)" fill="none" stroke="var(--accent)" stroke-width="18"/><ellipse cx="1000" cy="330" rx="190" ry="190" fill="var(--secondary)" opacity=".25"/><ellipse cx="1000" cy="330" rx="240" ry="60" transform="rotate(30 1000 330)" fill="none" stroke="var(--text)" stroke-width="3"/>',
    'retro-futurism': '<g fill="none" stroke="var(--accent)" stroke-width="3"><ellipse cx="1000" cy="360" rx="190" ry="240" transform="rotate(30 1000 360)"/><ellipse cx="1000" cy="360" rx="240" ry="90" transform="rotate(-25 1000 360)"/><path d="M770 360h450M1000 120v480"/></g><circle cx="1000" cy="360" r="65" fill="var(--secondary)"/><path d="m840 180 10-18 10 18-10 18zm280 350 8-15 8 15-8 15z" fill="var(--text)"/>',
    'neo-brutalism': '<rect x="850" y="190" width="300" height="340" fill="var(--text)"/><rect x="825" y="165" width="300" height="340" fill="var(--secondary)" stroke="var(--text)" stroke-width="7"/><circle cx="975" cy="335" r="85" fill="var(--accent)" stroke="var(--text)" stroke-width="7"/>',
    glass: '<circle cx="1040" cy="280" r="180" fill="var(--accent)" opacity=".7"/><circle cx="900" cy="480" r="150" fill="var(--secondary)" opacity=".8"/><rect class="glass-pane" x="820" y="170" width="340" height="370" rx="30"/>',
    neumorphism: '<rect class="relief" x="835" y="180" width="320" height="370" rx="44"/><circle class="relief-circle" cx="995" cy="340" r="85"/><path d="M920 485h150" class="thin"/>',
    clay: '<rect class="clay-block" x="850" y="180" width="260" height="260" rx="85" transform="rotate(-12 980 310)"/><circle class="clay-ball" cx="1080" cy="520" r="100"/>',
    'art-nouveau': '<g fill="none" stroke="var(--accent)" stroke-width="4"><path d="M110 630C30 480 200 470 95 270S135 30 210 90C360 210 65 170 160 330S30 590 210 630M1170 630c80-150-90-160 15-360S1145 30 1070 90C920 210 1215 170 1120 330s130 260-50 300M210 630c170 40 230-30 430 0s260 40 430 0"/><path d="M150 150q70-100 120 0-70 70-120 0M1130 150q-70-100-120 0 70 70 120 0" fill="var(--secondary)"/></g>',
    'new-typography': '<path d="M75 155h740v22H75zM75 560h400v12H75z" fill="var(--text)"/><rect x="900" y="100" width="300" height="510" fill="var(--accent)"/><text x="1090" y="590" transform="rotate(-90 1090 590)" fill="var(--on-accent)" font-size="100" font-family="sans-serif" font-weight="800">NEUE / 01</text>',
    'organic-design': '<path d="M900 130c150-70 350 70 280 210s-10 300-170 260-230-70-180-230-80-160 70-240" fill="var(--accent)"/><path d="M985 250c80-50 140 40 80 100s-160-40-80-100" fill="var(--background)"/><path d="M890 495c100-80 130 70 240-20" fill="none" stroke="var(--background)" stroke-width="8"/>',
    'space-age': '<rect x="795" y="110" width="410" height="500" rx="180" fill="var(--secondary)"/><circle cx="1000" cy="350" r="145" fill="var(--background)" stroke="var(--text)" stroke-width="5"/><ellipse cx="1000" cy="350" rx="180" ry="55" transform="rotate(-35 1000 350)" class="signal"/><circle cx="1000" cy="350" r="55" fill="var(--accent)"/>',
    'web-brutalism': '<path d="M75 165h1130M75 545h1130" class="thin"/><text x="80" y="600" class="art-label">[ index ] — [ notes ] — [ source ]</text>'
  };
  return `<svg class="artwork" aria-hidden="true" viewBox="0 0 1280 720">${drawings[id] || ''}</svg>`;
}

function chart(mode, r) {
  let drawing;
  if (mode === 'sequential') {
    const values = [22, 45, 72, 38, 65, 90];
    drawing = values.map((v, i) => {
      const c = r.sequential[v < 40 ? 0 : v < 70 ? 1 : 2];
      const x = 100 + i % 3 * 295, y = 65 + Math.floor(i / 3) * 125;
      return `<rect x="${x}" y="${y}" width="265" height="105" fill="${c}"/><rect x="${x + 82}" y="${y + 25}" width="100" height="55" rx="4" fill="${r.background}"/><text x="${x + 132}" y="${y + 62}" text-anchor="middle" fill="${r.text}" font-size="30">${v}</text>`;
    }).join('') + `<text x="100" y="365" class="chart-text">程度：低 → 高 · 六个观察单元</text>`;
  } else if (mode === 'diverging') {
    drawing = `<path d="M480 30v275" fill="none" stroke="${r.text}" stroke-width="3"/>` + [-12, 6, 18].map((v, i) => {
      const y = 50 + i * 85, w = Math.abs(v) * 16;
      return `<text x="90" y="${y + 32}" class="chart-text">组别 ${'ABC'[i]}</text><rect x="${v < 0 ? 480 - w : 480}" y="${y}" width="${w}" height="50" fill="${r.diverging[v < 0 ? 0 : 2]}"/><text x="${v < 0 ? 480 - w - 18 : 480 + w + 18}" y="${y + 33}" text-anchor="${v < 0 ? 'end' : 'start'}" class="chart-text">${v > 0 ? '+' : ''}${v}</text>`;
    }).join('') + '<text x="480" y="335" class="chart-text" text-anchor="middle">0 · 相对基线变化（分）</text>';
  } else {
    drawing = `<path d="M180 20v265h700" fill="none" stroke="${r.border}" stroke-width="2"/>` + [44, 68, 84].map((v, i) => {
      const y = 30 + i * 80;
      return `<text x="80" y="${y + 35}" class="chart-text">组别 ${'ABC'[i]}</text><rect x="180" y="${y}" width="${v * 7}" height="52" fill="${r.categorical[i]}"/><text x="${196 + v * 7}" y="${y + 35}" class="chart-text">${v}</text>`;
    }).join('') + [0, 50, 100].map(v => `<text x="${180 + v * 7}" y="320" class="chart-text" text-anchor="middle">${v}</text>`).join('') + '<text x="530" y="365" text-anchor="middle" class="chart-text">理解测验得分（0—100）</text>';
  }
  return `<svg class="data-chart" viewBox="0 0 1000 400" role="img" aria-label="${mode === 'categorical' ? '示例数据，A组44分，B组68分，C组84分' : mode === 'sequential' ? '示例强度值22、45、72、38、65、90' : '示例变化，A组负12分，B组正6分，C组正18分'}">${drawing}</svg>`;
}

export function renderSlide(style, palette, page = 0, { neutral = false, mode = 'categorical', interactive = true } = {}) {
  const headings = ['让知识<br>更易理解', '从问题到证据', mode === 'categorical' ? '结构化呈现提升理解' : mode === 'sequential' ? '观察强度如何分布' : '比较相对基线的变化', '把过程展示出来'];
  const body = page === 0 ? '<p class="slide-subtitle">结构化呈现如何影响学习？</p><p class="slide-byline">研究分享 / 示例内容</p>' : page === 1 ? `<div class="method-layout"><p class="method-intro">对齐、分组与视觉提示，帮助观众建立清晰的阅读路径。</p><ol class="steps"><li><b>01</b><span>提出问题</span><small>明确比较目标</small></li><li><b>02</b><span>比较方法</span><small>控制内容变量</small></li><li><b>03</b><span>验证结果</span><small>报告证据边界</small></li></ol></div>` : page === 2 ? `<div class="chart-panel">${chart(mode, rolesFor(palette, neutral))}</div><p class="chart-note">示例数据 · 仅用于预览，不代表真实实验结论。</p>` : `<div class="media-layout"><div class="video-placeholder"><span aria-hidden="true">▷</span><b>视频区域示意</b><small>接入视频后可播放 · 需提供字幕与控制</small></div><div class="demo-panel"><b>交互示例：结构提示</b><p>调整强度，观察分组边界。</p><label>提示强度 <output>50%</output><input type="range" min="0" max="100" value="50" aria-label="结构提示强度" ${interactive ? '' : 'disabled'}></label><div class="demo-items" style="--hint:.5"><i>问题</i><i>方法</i><i>证据</i></div><button class="demo-reset" type="button" ${interactive ? '' : 'disabled'}>重置为50%</button></div></div>`;
  return `<div class="slide-canvas"><div class="v-slide style-${style.id} page-${page}" style="${cssVars(palette, neutral)}">${artwork(style.id)}<div class="slide-kicker"><span>${page ? ['','METHOD','EVIDENCE','MEDIA'][page] : 'RESEARCH / 01'}</span><span>${String(page + 1).padStart(2, '0')} / 04</span></div><div class="slide-content"><h3 class="slide-title">${headings[page]}</h3>${body}</div><div class="slide-foot"><span>${esc(style.en)}</span><span>${page === 0 ? 'KNOWLEDGE / FORM / CLARITY' : '同一内容 · 不同视觉语言'}</span></div></div></div>`;
}
