const { readFileSync } = require('node:fs');
const { stripTypeScriptTypes } = require('node:module');
const vm = require('node:vm');
const assert = require('node:assert/strict');
function load(file, exports, mocks = {}) {
  const source = readFileSync(`src/services/${file}.ts`, 'utf8')
    .replace(/import[\s\S]*?from ['"][^'"]+['"];?/g, '').replace(/export /g, '');
  return vm.runInNewContext(stripTypeScriptTypes(source) + `\n;({${exports}})`, { Date, Error, ...mocks });
}
const order = { id: 'order', order_number: 'TEF-test', order_date: '2026-09-04', meal_type: 'lunch', slot_label: '12:00:00 – 12:45:00', status: 'confirmed', created_at: '2026-09-03T10:00:00Z', updated_at: '2026-09-03T10:00:00Z', notes: 'Less salt', items: [{ id: 'item', meal_name: 'Thali', quantity: 2, preferences: { spiceLevel: 'Less Spicy', oilLevel: 'Standard', dietType: 'jain_satvik' }, addons: [{ id: 'addon', name: 'Roti', quantity: 3 }] }] };
const calls = [];
let response = { data: [order], error: null };
const service = load('kitchenService', 'kitchenService,KitchenError,parseKitchenOrder', {
  getSupabaseClient: () => ({ rpc: async (name, args) => { calls.push({ name, args }); return response; } }),
});
const { createKitchenQueue } = load('kitchenQueue', 'createKitchenQueue', service);
const deferred = () => { let resolve, reject; const promise = new Promise((a, b) => { resolve = a; reject = b; }); return { promise, resolve, reject }; };
(async () => {
  const rows = await service.kitchenService.list(order.order_date, 'lunch');
  assert.equal(rows[0].items[0].addons[0].quantity, 3);
  assert.equal(calls[0].name, 'get_kitchen_orders');
  response = { data: { ...order, status: 'preparing' }, error: null };
  await service.kitchenService.advance(order);
  assert.equal(calls[1].args.p_expected_status, 'confirmed');
  assert.equal(calls[1].args.p_next_status, 'preparing');
  assert.equal(Object.keys(calls[1].args).length, 3);
  response = { data: null, error: { code: '42501' } };
  await assert.rejects(service.kitchenService.list(order.order_date, 'lunch'), /authorized account/);
  response = { data: [{ ...order, meal_type: 'dinner' }], error: null };
  await assert.rejects(service.kitchenService.list(order.order_date, 'lunch'));
  for (const invalid of [null, { ...order, items: [] }, { ...order, status: 'delivered' }, { ...order, items: [{ ...order.items[0], quantity: 0 }] }]) assert.throws(() => service.parseKitchenOrder(invalid));

  let state, listResult = [order], advanceCalls = 0, pendingWrite;
  let queue = createKitchenQueue(order.order_date, 'lunch', next => { state = next; }, {
    list: async () => listResult,
    advance: () => { advanceCalls++; pendingWrite = deferred(); return pendingWrite.promise; },
  });
  await queue.refresh();
  const write = queue.advance('order');
  await queue.advance('order'); // Rapid double tap must submit once.
  assert.equal(advanceCalls, 1); assert.equal(state.orders[0].status, 'confirmed'); assert.equal(state.busyId, 'order');
  listResult = [{ ...order, status: 'preparing' }]; pendingWrite.resolve(listResult[0]); await write;
  assert.equal(state.orders[0].status, 'preparing'); assert.equal(state.busyId, null);
  const uncertain = queue.advance('order');
  listResult = [{ ...order, status: 'ready' }]; pendingWrite.reject(new Error('Lost response')); await uncertain;
  assert.equal(state.orders[0].status, 'ready'); assert.match(state.notice, /could not confirm/);
  queue.dispose();

  // A poll started before the mutation must not restore the old state.
  const stale = deferred(); let reads = 0;
  queue = createKitchenQueue(order.order_date, 'lunch', next => { state = next; }, {
    list: async () => ++reads === 2 ? stale.promise : [reads === 1 ? order : { ...order, status: 'preparing' }],
    advance: async () => ({ ...order, status: 'preparing' }),
  });
  await queue.refresh(); const oldPoll = queue.refresh(); await queue.advance('order');
  stale.resolve([order]); await oldPoll; assert.equal(state.orders[0].status, 'preparing'); queue.dispose();

  // Filter/account changes invalidate both pending reads and writes.
  for (const mode of ['read', 'write']) {
    let published = 0; const late = deferred();
    queue = createKitchenQueue(order.order_date, 'lunch', () => { published++; }, {
      list: async () => mode === 'read' ? late.promise : [order], advance: async () => late.promise,
    });
    const job = mode === 'read' ? queue.refresh() : (await queue.refresh(), queue.advance('order'));
    queue.dispose(); const atDispose = published;
    late.resolve(mode === 'read' ? [order] : { ...order, status: 'preparing' }); await job;
    assert.equal(published, atDispose);
  }
  // Failed polls retain a labelled snapshot, pause writes; revocation clears private data.
  let denied = false, offline = false;
  queue = createKitchenQueue(order.order_date, 'lunch', next => { state = next; }, {
    list: async () => { if (denied) throw new service.KitchenError('42501'); if (offline) throw new Error('Offline'); return [order]; },
    advance: async () => { throw new Error('Should be paused'); },
  });
  await queue.refresh(); offline = true; await queue.refresh(); await queue.advance('order');
  assert.equal(state.orders.length, 1); assert.ok(state.error); assert.equal(state.busyId, null);
  denied = true; await queue.refresh(); assert.equal(state.orders.length, 0); assert.equal(state.lastUpdated, null);
  queue.dispose();
  console.log('PASS: kitchen contract, duplicate clicks, uncertain writes, stale polls, account/filter changes, offline and revoked access');
})().catch(error => { console.error(error); process.exitCode = 1; });
