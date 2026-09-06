const { readFileSync } = require('node:fs');
const { stripTypeScriptTypes } = require('node:module');
const vm = require('node:vm');
const assert = require('node:assert/strict');

const source = readFileSync('src/services/kitchenShiftService.ts', 'utf8')
  .replace(/import[\s\S]*?from ['"][^'"]+['"];?/g, '')
  .replace(/export /g, '');
const calls = [];
let response = { data: null, error: null };
const api = vm.runInNewContext(
  stripTypeScriptTypes(source) + '\n;({ kitchenShiftService, parseKitchenShiftBrief, KitchenShiftError })',
  { Error, Number, getSupabaseClient: () => ({ rpc: async (name, args) => { calls.push({ name, args }); return response; } }) },
);

const brief = {
  service_date: '2026-09-07', meal_type: 'lunch',
  slots: [{ id: 'slot', name: 'Lunch 1', start_time: '12:00:00', end_time: '12:45:00', max_portions: 20, booked_portions: '17', remaining_portions: 3, utilization_percent: '85.0' }],
  handover: { note: 'Check Jain meals', updated_at: null, updated_by: null },
};

(async () => {
  const parsed = api.parseKitchenShiftBrief(brief);
  assert.equal(parsed.slots[0].booked_portions, 17);
  assert.equal(parsed.slots[0].utilization_percent, 85);
  for (const invalid of [null, { ...brief, slots: null }, { ...brief, slots: [{ ...brief.slots[0], remaining_portions: -1 }] }, { ...brief, handover: { ...brief.handover, note: 1 } }]) {
    assert.throws(() => api.parseKitchenShiftBrief(invalid));
  }

  response = { data: brief, error: null };
  await api.kitchenShiftService.get('2026-09-07', 'lunch');
  assert.equal(JSON.stringify(calls[0]), JSON.stringify({ name: 'get_kitchen_shift_brief', args: { p_service_date: '2026-09-07', p_meal_type: 'lunch' } }));

  response = { data: { ...brief, handover: { note: 'Ready', updated_at: '2026-09-07T04:00:00Z', updated_by: 'Shift Lead' } }, error: null };
  await api.kitchenShiftService.save('2026-09-07', 'lunch', 'Ready', null);
  assert.equal(JSON.stringify(calls[1]), JSON.stringify({ name: 'save_kitchen_shift_handover', args: { p_service_date: '2026-09-07', p_meal_type: 'lunch', p_note: 'Ready', p_expected_updated_at: null } }));

  response = { data: null, error: { code: '40001' } };
  await assert.rejects(api.kitchenShiftService.save('2026-09-07', 'lunch', 'Changed', 'old'), /latest note/);
  console.log('PASS: kitchen capacity validation, exact handover RPC contract and conflict handling');
})().catch(error => { console.error(error); process.exitCode = 1; });

