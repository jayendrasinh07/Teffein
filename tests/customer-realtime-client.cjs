const { readFileSync } = require('node:fs');
const { stripTypeScriptTypes } = require('node:module');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const { webcrypto } = require('node:crypto');

const source = readFileSync('src/services/orderService.ts', 'utf8')
  .replace(/import[\s\S]*?from ['"][^'"]+['"];?/g, '')
  .replace(/export /g, '');
let changeHandler;
let removed = false;
const channel = {
  on(event, config, handler) {
    assert.equal(event, 'postgres_changes');
    assert.equal(JSON.stringify(config), JSON.stringify({ event: 'UPDATE', schema: 'public', table: 'orders', filter: 'user_id=eq.customer' }));
    changeHandler = handler;
    return this;
  },
  subscribe() { return this; },
};
const client = {
  channel(name) { assert.match(name, /^customer-orders-customer-/); return channel; },
  async removeChannel(value) { assert.equal(value, channel); removed = true; },
};
const api = vm.runInNewContext(
  stripTypeScriptTypes(source) + '\n;({ orderService })',
  { Error, Map, Promise, Object, Number, TextEncoder, crypto: webcrypto, getSupabaseClient: () => client },
);
let refreshes = 0;
const unsubscribe = api.orderService.subscribe('customer', () => { refreshes += 1; });
changeHandler();
assert.equal(refreshes, 1);
unsubscribe();
changeHandler();
assert.equal(refreshes, 1);
setTimeout(() => { assert.equal(removed, true); console.log('PASS: customer order realtime is owner-filtered and safely disposed'); }, 0);

