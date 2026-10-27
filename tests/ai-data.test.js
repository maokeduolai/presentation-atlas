import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { styles, chartModes, rolesFor, makePrompt, completePack, paletteCSS } from '../src/styles.js';
import { createCatalog, createIndex, createAIText, paletteId } from '../src/ai-data.js';
import { exportData } from '../scripts/export-data.mjs';

test('机器数据的全部180个组合与网页导出相同，历史与来源保留', () => {
  const catalog = createCatalog(), index = createIndex();
  assert.equal(catalog.schema_version, '1.0.0');
  assert.equal(catalog.count, styles.length);
  assert.deepEqual(index.styles.map(s => s.id), styles.map(s => s.id));
  for (const source of styles) {
    const machine = catalog.styles.find(s => s.id === source.id);
    assert.equal(machine.history, source.history);
    assert.deepEqual(machine.visual, source.visual);
    assert.deepEqual(machine.contexts, source.contexts);
    assert.ok(machine.sources.length);
    assert.equal(new Set(machine.palettes.map(p => p.id)).size, source.palettes.length);
    for (const p of source.palettes) {
      assert.match(paletteId(p), /^[a-z0-9]+(?:-[a-z0-9]+)*$/);
      const exported = machine.palettes.find(x => x.id === paletteId(p));
      assert.deepEqual(exported.roles, rolesFor(p));
      for (const mode of Object.keys(chartModes)) {
        assert.equal(exported.variants[mode].css, paletteCSS(p, mode));
        assert.equal(exported.variants[mode].prompt, makePrompt(source, p, mode));
        assert.equal(exported.variants[mode].complete_pack, completePack(source, p, mode));
      }
    }
  }
});

test('静态索引的每个详情与默认包路径存在且与共用数据一致', async () => {
  const temp = await mkdtemp(join(tmpdir(), 'atlas-api-'));
  try {
    await exportData(temp);
    const index = JSON.parse(await readFile(join(temp, 'api/v1/index.json'), 'utf8'));
    for (const item of index.styles) {
      const s = styles.find(x => x.id === item.id);
      const detail = JSON.parse(await readFile(join(temp, 'api/v1', item.detail), 'utf8'));
      assert.equal(detail.id, item.id);
      assert.equal(await readFile(join(temp, 'api/v1', item.default_pack), 'utf8'), completePack(s, s.palettes[0]));
    }
    assert.equal(await readFile(join(temp, 'llms-full.txt'), 'utf8'), createAIText());
    assert.deepEqual(JSON.parse(await readFile(join(temp, 'api/v1/catalog.json'), 'utf8')), createCatalog());
  } finally { await rm(temp, { recursive: true, force: true }); }
});
