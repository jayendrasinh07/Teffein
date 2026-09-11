const { readFileSync } = require('node:fs');
const { stripTypeScriptTypes } = require('node:module');
const vm = require('node:vm');
const assert = require('node:assert/strict');

const source = readFileSync('src/services/kitchenManagementService.ts', 'utf8')
  .replace(/import[\s\S]*?from ['"][^'"]+['"];?/g, '')
  .replace(/export /g, '');
const calls = [];
let response = { data: null, error: null };
const api = vm.runInNewContext(
  stripTypeScriptTypes(source) + '\n;({ kitchenManagementService, parseKitchenManagement, KitchenManagementError })',
  { Error, Number, getSupabaseClient: () => ({ rpc: async (name, args) => { calls.push({ name, args }); return response; } }) },
);

const document = {
  payment_mode: 'manual', cutoffs: { breakfast: '22:00:00', lunch: '10:30:00', dinner: '17:30:00' },
  slots: [{ id: 'slot', name: 'Lunch 1', meal_type: 'lunch', start_time: '12:00:00', end_time: '12:45:00', cutoff_time: '10:30:00', max_portions: '200', is_active: true, booked_today: '12', peak_booked_portions: 20 }],
  staff: [{ user_id: 'user', full_name: 'Kitchen Lead', email: 'lead@example.com', added_at: '2026-09-06T10:00:00Z' }],
};

(async () => {
  const parsed = api.parseKitchenManagement(document);
  assert.equal(parsed.slots[0].max_portions, 200);
  assert.equal(parsed.slots[0].booked_today, 12);
  for (const invalid of [null, { ...document, payment_mode: 'online' }, { ...document, cutoffs: { breakfast: '22:00:00', lunch: '11:15:00', dinner: '17:30:00' } }, { ...document, slots: [{ ...document.slots[0], peak_booked_portions: -1 }] }]) {
    assert.throws(() => api.parseKitchenManagement(invalid));
  }

  response = { data: document, error: null };
  await api.kitchenManagementService.get();
  await api.kitchenManagementService.saveSlot('slot', 250, false);
  await api.kitchenManagementService.grantStaff(' Lead@Example.com ');
  await api.kitchenManagementService.revokeStaff('user');
  assert.equal(JSON.stringify(calls), JSON.stringify([
    { name: 'get_kitchen_management', args: undefined },
    { name: 'save_kitchen_delivery_slot', args: { p_slot_id: 'slot', p_max_portions: 250, p_is_active: false } },
    { name: 'grant_kitchen_access', args: { p_email: 'lead@example.com' } },
    { name: 'revoke_kitchen_access', args: { p_user_id: 'user' } },
  ]));
  assert.throws(() => api.kitchenManagementService.saveSlot('slot', 5001, true), /Check the value/);
  assert.throws(() => api.kitchenManagementService.grantStaff('invalid'), /Check the value/);
  response = { data: null, error: { code: '42501' } };
  await assert.rejects(api.kitchenManagementService.get(), /Admin access/);
  response = { data: null, error: { code: '23514' } };
  await assert.rejects(api.kitchenManagementService.saveSlot('slot', 10, true), /already booked/);
  console.log('PASS: admin management parsing, exact RPC contracts and access/capacity errors');
})().catch(error => { console.error(error); process.exitCode = 1; });

