import test from 'node:test';
import assert from 'node:assert/strict';
import { money, dateTime, windowLabel, refHref } from './lib.js';

test('every monetary value uses RM and exactly two decimal places', () => {
  assert.equal(money(1250), 'RM 1,250.00');
  assert.equal(money(0), 'RM 0.00');
  assert.equal(money(12.5), 'RM 12.50');
});
test('timestamps render in Malaysia even across a UTC date boundary', () => {
  const label = dateTime('2026-10-23T18:30:00+00:00');
  assert.match(label, /24 Oct/);
  assert.match(label, /02:30/);
});
test('service windows include their date and MYT', () => {
  assert.equal(windowLabel({ date: '2026-10-24', start: '14:00', end: '17:00' }), '2026-10-24 · 14:00–17:00 MYT');
  assert.equal(refHref({ type: 'confirmation', id: 'q_123' }), '#confirmations:q_123');
});
