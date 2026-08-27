import { test } from 'node:test';
import assert from 'node:assert/strict';
import { PRESETS, DEFAULT_ENABLED_TYPE_IDS, getPreset } from '../src/lib/presets.js';
import { ALL_GENERATOR_IDS } from '../src/lib/generators/index.js';

test('every preset references only real, non-duplicated generator ids', () => {
  for (const preset of PRESETS) {
    assert.ok(preset.typeIds.length > 0, `${preset.id} should not be empty`);
    const seen = new Set();
    for (const id of preset.typeIds) {
      assert.ok(ALL_GENERATOR_IDS.includes(id), `${preset.id}: unknown id ${id}`);
      assert.ok(!seen.has(id), `${preset.id}: duplicate id ${id}`);
      seen.add(id);
    }
  }
});

test('the "all" preset covers every generator', () => {
  const all = getPreset('all');
  assert.equal(all.typeIds.length, ALL_GENERATOR_IDS.length);
  for (const id of ALL_GENERATOR_IDS) {
    assert.ok(all.typeIds.includes(id), `all preset missing ${id}`);
  }
});

test('the default enabled set is the NCLEX preset and is non-empty', () => {
  assert.equal(DEFAULT_ENABLED_TYPE_IDS, getPreset('nclex').typeIds);
  assert.ok(DEFAULT_ENABLED_TYPE_IDS.length > 0);
});
