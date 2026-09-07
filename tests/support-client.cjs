const { readFileSync } = require('node:fs');
const { stripTypeScriptTypes } = require('node:module');
const vm = require('node:vm');
const assert = require('node:assert/strict');

const source = readFileSync('src/services/supportService.ts', 'utf8')
  .replace(/import[\s\S]*?from ['"][^'"]+['"];?/g, '')
  .replace(/export /g, '');
const calls = [];
const customer = { id: 'request', order_id: 'order', order_number: 'TEF-1', category: 'order_help', message: 'Please check my delivery time.', status: 'open', created_at: '2026-09-07T09:00:00Z', updated_at: '2026-09-07T09:00:00Z' };
const kitchen = { ...customer, customer_name: 'Customer', customer_email: 'customer@example.com', customer_phone: '9999999999' };
let response = { data: customer, error: null };
const api = vm.runInNewContext(
  stripTypeScriptTypes(source) + '\n;({ supportService, parseSupportRequests, SupportError })',
  { Error, Array, getSupabaseClient: () => ({ rpc: async (name, args) => { calls.push({ name, args }); return response; } }) },
);

(async () => {
  const created = await api.supportService.create('order_help', '  Please check my delivery time.  ', 'order');
  assert.equal(created.id, 'request');
  assert.equal(JSON.stringify(calls[0]), JSON.stringify({ name: 'create_support_request', args: { p_category: 'order_help', p_message: 'Please check my delivery time.', p_order_id: 'order' } }));
  await assert.rejects(api.supportService.create('order_help', 'short', null), /Check the topic/);

  response = { data: [customer], error: null };
  assert.equal((await api.supportService.getMine()).length, 1);
  response = { data: [kitchen], error: null };
  assert.equal((await api.supportService.getKitchen())[0].customer_email, 'customer@example.com');
  assert.equal((await api.supportService.updateKitchen('request', 'resolved'))[0].status, 'open');
  assert.equal(JSON.stringify(calls.slice(1)), JSON.stringify([
    { name: 'get_my_support_requests', args: undefined },
    { name: 'get_kitchen_support_requests', args: undefined },
    { name: 'update_kitchen_support_request', args: { p_request_id: 'request', p_status: 'resolved' } },
  ]));
  assert.throws(() => api.parseSupportRequests([{ ...kitchen, customer_email: 5 }], true));
  response = { data: null, error: { code: '42501' } };
  await assert.rejects(api.supportService.getKitchen(), /required account access/);
  console.log('PASS: secure customer support contracts, validation and admin queue controls');
})().catch(error => { console.error(error); process.exitCode = 1; });

