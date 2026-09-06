const { readFileSync } = require('node:fs');
const { stripTypeScriptTypes } = require('node:module');
const vm = require('node:vm');
const assert = require('node:assert/strict');

const source = readFileSync('src/services/kitchenAlertEngine.ts', 'utf8')
  .replace(/import[\s\S]*?from ['"][^'"]+['"];?/g, '')
  .replace(/export /g, '');
const api = vm.runInNewContext(
  stripTypeScriptTypes(source) + '\n;({ kitchenOrderAge, newConfirmedOrders })',
  { Date, Math, Number, Set },
);
const now = Date.parse('2026-09-06T10:30:00Z');
const order = { id: 'new', status: 'confirmed', created_at: '2026-09-06T10:19:30Z', updated_at: '2026-09-06T10:19:30Z' };
assert.deepEqual(JSON.parse(JSON.stringify(api.kitchenOrderAge(order, now))), { minutes: 10, late: true, critical: false, label: '10 min waiting' });
assert.equal(api.kitchenOrderAge({ ...order, status: 'preparing', updated_at: '2026-09-06T09:59:00Z' }, now).critical, true);
assert.equal(api.kitchenOrderAge({ ...order, status: 'ready' }, now), null);
assert.deepEqual(api.newConfirmedOrders(new Set(['old']), [{ ...order, id: 'old' }, order, { ...order, id: 'prep', status: 'preparing' }]).map(item => item.id), ['new']);
console.log('PASS: Kitchen new-order detection and stage-specific SLA timing');

