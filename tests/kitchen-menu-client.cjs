const { readFileSync } = require('node:fs');
const { stripTypeScriptTypes } = require('node:module');
const vm = require('node:vm');
const assert = require('node:assert/strict');

const source = readFileSync('src/services/kitchenMenuService.ts', 'utf8')
  .replace(/import[\s\S]*?from ['"][^'"]+['"];?/g, '')
  .replace(/export /g, '');

const calls = [];
let response = { data: null, error: null };
const api = vm.runInNewContext(
  stripTypeScriptTypes(source) + '\n;({ kitchenMenuService, parseKitchenMenu, KitchenMenuError })',
  {
    Error, Number, Set,
    getSupabaseClient: () => ({
      rpc: async (name, args) => { calls.push({ name, args }); return response; },
    }),
  }
);

const document = {
  menu_date: '2026-09-05', is_published: false, is_locked: false, updated_at: null,
  meals: [
    { id: 'lunch', name: 'Executive Thali', description: null, meal_type: 'lunch', diet_type: 'standard_gujarati', base_price: 119, selected: true },
    { id: 'dinner', name: 'Khichdi', description: 'Light dinner', meal_type: 'dinner', diet_type: 'standard_gujarati', base_price: '109', selected: false },
  ],
};

(async () => {
  const parsed = api.parseKitchenMenu(document);
  assert.equal(parsed.menuDate, '2026-09-05');
  assert.equal(parsed.meals[0].description, '');
  assert.equal(parsed.meals[1].basePrice, 109);
  for (const invalid of [null, { ...document, meals: null }, { ...document, meals: [{ ...document.meals[0], selected: 'yes' }] }]) {
    assert.throws(() => api.parseKitchenMenu(invalid));
  }

  response = { data: document, error: null };
  await api.kitchenMenuService.get('2026-09-05');
  assert.equal(JSON.stringify(calls[0]), JSON.stringify({ name: 'get_kitchen_menu', args: { p_menu_date: '2026-09-05' } }));

  response = { data: { ...document, is_published: true }, error: null };
  const published = await api.kitchenMenuService.save('2026-09-05', ['lunch', 'dinner'], true);
  assert.equal(published.isPublished, true);
  assert.equal(JSON.stringify(calls[1]), JSON.stringify({
    name: 'save_kitchen_menu',
    args: { p_menu_date: '2026-09-05', p_meal_ids: ['lunch', 'dinner'], p_publish: true },
  }));

  await assert.rejects(api.kitchenMenuService.save('2026-09-05', ['lunch', 'lunch'], false), /only be selected once/);
  response = { data: null, error: { code: '42501', message: 'denied' } };
  await assert.rejects(api.kitchenMenuService.get('2026-09-05'), /authorized account/);
  console.log('PASS: kitchen menu response validation, exact RPC contract, duplicate guard and access errors');
})().catch(error => { console.error(error); process.exitCode = 1; });

