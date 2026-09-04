const { readFileSync } = require('node:fs');
const { stripTypeScriptTypes } = require('node:module');
const vm = require('node:vm');
const assert = require('node:assert/strict');

const source = readFileSync('src/services/kitchenCatalogService.ts', 'utf8')
  .replace(/import[\s\S]*?from ['"][^'"]+['"];?/g, '')
  .replace(/export /g, '');

const calls = [];
let response = { data: null, error: null };
const api = vm.runInNewContext(
  stripTypeScriptTypes(source) + '\n;({ kitchenCatalogService, parseKitchenCatalog, KitchenCatalogError })',
  {
    Error, Number,
    getSupabaseClient: () => ({
      rpc: async (name, args) => { calls.push({ name, args }); return response; },
    }),
  },
);

const meal = {
  id: 'meal-1', name: 'Gujarati Thali', description: 'Home-style meal', image_url: null,
  meal_type: 'lunch', diet_type: 'standard_gujarati', base_price: '119.50', is_active: true,
  created_at: '2026-09-04T08:00:00Z', updated_at: '2026-09-04T08:00:00Z',
};

(async () => {
  const parsed = api.parseKitchenCatalog([meal]);
  assert.equal(parsed[0].basePrice, 119.5);
  assert.equal(parsed[0].imageUrl, '');

  for (const invalid of [null, [{ ...meal, is_active: 'yes' }], [{ ...meal, base_price: 0 }], [{ ...meal, meal_type: 'breakfast' }]]) {
    assert.throws(() => api.parseKitchenCatalog(invalid));
  }

  response = { data: [meal], error: null };
  await api.kitchenCatalogService.list();
  assert.equal(JSON.stringify(calls[0]), JSON.stringify({ name: 'get_kitchen_catalog', args: undefined }));

  response = { data: [{ ...meal, base_price: 129 }], error: null };
  const saved = await api.kitchenCatalogService.save({
    id: meal.id,
    name: meal.name,
    description: meal.description,
    imageUrl: '',
    mealType: 'lunch',
    dietType: 'standard_gujarati',
    basePrice: 129,
    isActive: true,
  });
  assert.equal(saved[0].basePrice, 129);
  assert.equal(JSON.stringify(calls[1]), JSON.stringify({
    name: 'save_kitchen_meal',
    args: {
      p_meal_id: meal.id,
      p_name: meal.name,
      p_description: meal.description,
      p_image_url: '',
      p_meal_type: 'lunch',
      p_diet_type: 'standard_gujarati',
      p_base_price: 129,
      p_is_active: true,
    },
  }));

  response = { data: null, error: { code: '42501', message: 'denied' } };
  await assert.rejects(api.kitchenCatalogService.list(), /authorized account/);
  console.log('PASS: kitchen catalog validation, exact RPC contracts and access errors');
})().catch(error => { console.error(error); process.exitCode = 1; });

