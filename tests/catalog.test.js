import test from 'node:test';
import assert from 'node:assert/strict';
import { styles, kinds, sources, chartModes, contrast, checksFor, rolesFor, paletteCSS, makePrompt, completePack } from '../src/styles.js';
import { renderSlide } from '../src/slides.js';

test('历史关系可解析，配色和来源完整，预设不伪造起源年', () => {
  assert.equal(new Set(styles.map(s => s.id)).size, 30);
  for (const s of styles) {
    assert.ok(kinds[s.kind]);
    assert.equal(s.visual.length, 4);
    if (s.kind === 'preset') assert.equal(s.year, null, s.id);
    assert.ok(s.history.length > 40 && s.refs.length > 0, s.id);
    s.refs.forEach(k => assert.ok(sources[k]?.[1].startsWith('https://'), k));
    s.related.forEach(([id, relation]) => { assert.ok(styles.some(x => x.id === id), id); assert.notEqual(id, s.id); assert.ok(relation); });
    assert.equal(s.palettes.length, 2);
    s.palettes.forEach(p => assert.ok(p.colors.every(c => /^#[\da-f]{6}$/i.test(c))));
  }
});

test('相对亮度使用线性sRGB，边界判断不使用提前四舍五入的值', () => {
  assert.equal(contrast('#000000', '#ffffff'), 21);
  assert.equal(contrast('#ffffff', '#ffffff'), 1);
  assert.ok(Math.abs(contrast('#ff0000', '#ffffff') - 3.99847677075) < 1e-8);
  assert.ok(contrast('#777777', '#ffffff') < 4.5);
  assert.ok(contrast('#767676', '#ffffff') >= 4.5);
});

test('所有发布配色的文字与必要边界组合达到各自参考值', () => {
  for (const s of styles) for (const p of s.palettes) {
    for (const c of checksFor(p)) assert.ok(c.pass, `${s.id}/${p.name}/${c.label}: ${c.ratio}`);
    const r = rolesFor(p);
    assert.notDeepEqual(r.categorical, r.sequential);
    assert.notDeepEqual(r.sequential, r.diverging);
  }
});

test('切换风格、配色、数据类型后，三种复制输出均包含当前角色值', () => {
  for (const s of styles) for (const p of s.palettes) for (const mode of Object.keys(chartModes)) {
    const r = rolesFor(p);
    for (const output of [paletteCSS(p,mode), makePrompt(s,p,mode), completePack(s,p,mode)]) {
      assert.ok(output.includes(p.name));
      assert.ok(output.includes(`--background: ${r.background};`));
      assert.ok(output.includes(`--chart-1: ${r[mode][0]};`));
    }
    assert.ok(completePack(s,p,mode).includes(s.history));
  }
});

test('所有条目覆盖四页；图表语义、媒体占位与交互控件明确', () => {
  for (const s of styles) for (const p of s.palettes) {
    const title = renderSlide(s,p,0);
    assert.ok(title.includes('让知识<br>更易理解'));
    assert.ok(renderSlide(s,p,1).includes('报告证据边界'));
    assert.ok(renderSlide(s,p,2).includes('A组44分，B组68分，C组84分'));
    assert.ok(renderSlide(s,p,2,{mode:'diverging'}).includes('A组负12分'));
    assert.ok(renderSlide(s,p,2,{mode:'sequential'}).includes('22、45、72、38、65、90'));
    const media = renderSlide(s,p,3);
    assert.ok(media.includes('接入视频后可播放'));
    assert.ok(media.includes('aria-label="结构提示强度"'));
  }
});
