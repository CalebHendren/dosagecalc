import { test } from 'node:test';
import assert from 'node:assert/strict';
import { GENERATORS, TOTAL_VARIANTS } from '../src/lib/generators/index.js';

test('every generator declares a positive variant count', () => {
  for (const g of GENERATORS) {
    assert.ok(
      Number.isInteger(g.variants) && g.variants > 0,
      `${g.id} should declare a positive integer variants count`,
    );
  }
});

test('TOTAL_VARIANTS is the sum of the per-generator counts', () => {
  const sum = GENERATORS.reduce((n, g) => n + g.variants, 0);
  assert.equal(TOTAL_VARIANTS, sum);
  assert.ok(TOTAL_VARIANTS > 100000, 'expected a large theoretical space');
});
