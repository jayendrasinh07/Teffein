const { readFileSync } = require('node:fs');
const { stripTypeScriptTypes } = require('node:module');
const vm = require('node:vm');
const assert = require('node:assert/strict');

const source = readFileSync('src/services/kitchenAnalyticsService.ts', 'utf8')
  .replace(/import[\s\S]*?from ['"][^'"]+['"];?/g, '').replace(/export /g, '');
const calls = [];
let response = { data: null, error: null };
const api = vm.runInNewContext(stripTypeScriptTypes(source) + '\n;({ kitchenAnalyticsService, parseKitchenAnalytics, KitchenAnalyticsError })', {
  Date, Error, Number, Object,
  getSupabaseClient: () => ({ rpc: async (name, args) => { calls.push({ name, args }); return response; } }),
});
const report = {
  start_date: '2026-09-01', end_date: '2026-09-02', generated_at: '2026-09-08T00:00:00Z',
  summary: { total_orders: '3', active_orders: 2, cancelled_orders: 1, cancellation_rate: '33.3', total_portions: 3, booked_value: '350', average_order_value: 175, paid_value: 0, pending_value: 350 },
  daily: [{ date: '2026-09-01', orders: '2', cancelled: 1, portions: 2, booked_value: 200 }],
  statuses: [{ status: 'confirmed', orders: 2 }], meal_types: [{ meal_type: 'lunch', orders: 2, portions: 3 }],
  payments: [{ payment_status: 'pending', orders: 2, value: 350 }], top_meals: [{ meal_name: 'Gujarati Thali', portions: 3 }],
};

(async () => {
  response = { data: report, error: null };
  const parsed = await api.kitchenAnalyticsService.get('2026-09-01', '2026-09-02');
  assert.equal(parsed.summary.booked_value, 350);
  assert.equal(parsed.daily[0].orders, 2);
  assert.deepEqual(JSON.parse(JSON.stringify(calls)), [{ name: 'get_kitchen_business_analytics', args: { p_start_date: '2026-09-01', p_end_date: '2026-09-02' } }]);
  assert.equal(api.parseKitchenAnalytics({ ...report, meal_types: [{ meal_type: 'breakfast', orders: 1, portions: 1 }] }).meal_types[0].meal_type, 'breakfast');
  for (const invalid of [null, { ...report, summary: { ...report.summary, booked_value: -1 } }, { ...report, summary: { ...report.summary, total_orders: undefined } }, { ...report, meal_types: [{ meal_type: 'snack', orders: 1, portions: 1 }] }]) assert.throws(() => api.parseKitchenAnalytics(invalid));
  await assert.rejects(api.kitchenAnalyticsService.get('2026-09-02', '2026-09-01'), /valid report range/);
  await assert.rejects(api.kitchenAnalyticsService.get('2026-01-01', '2026-09-01'), /valid report range/);
  response = { data: null, error: { code: '42501' } };
  await assert.rejects(api.kitchenAnalyticsService.get('2026-09-01', '2026-09-02'), /MFA-verified admin/);
  console.log('PASS: admin analytics validation, date limits, numeric normalization and exact RPC contract');
})().catch(error => { console.error(error); process.exitCode = 1; });
