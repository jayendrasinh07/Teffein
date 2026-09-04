import { getSupabaseClient } from './supabaseClient';

export type KitchenCatalogMealType = 'lunch' | 'dinner' | 'both';
export type KitchenCatalogDietType =
  | 'standard_gujarati'
  | 'jain_satvik'
  | 'kathiyawadi'
  | 'low_oil_fit'
  | 'north_indian';

export interface KitchenCatalogMeal {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  mealType: KitchenCatalogMealType;
  dietType: KitchenCatalogDietType;
  basePrice: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface KitchenCatalogMealInput {
  id?: string;
  name: string;
  description: string;
  imageUrl: string;
  mealType: KitchenCatalogMealType;
  dietType: KitchenCatalogDietType;
  basePrice: number;
  isActive: boolean;
}

export class KitchenCatalogError extends Error {
  code: string;

  constructor(code: string, message?: string) {
    super(
      code === '42501'
        ? 'Kitchen access is unavailable. Sign in with an authorized account.'
        : code === '22023' || code === '23514'
          ? message || 'Check the meal details and price.'
          : code === 'P0002'
            ? 'This meal no longer exists. Refresh the catalog.'
            : message || 'The meal catalog could not be saved. Refresh and try again.'
    );
    this.code = code;
  }
}

const mealTypes: KitchenCatalogMealType[] = ['lunch', 'dinner', 'both'];
const dietTypes: KitchenCatalogDietType[] = [
  'standard_gujarati', 'jain_satvik', 'kathiyawadi', 'low_oil_fit', 'north_indian',
];

export function parseKitchenCatalog(value: unknown): KitchenCatalogMeal[] {
  if (!Array.isArray(value)) throw new KitchenCatalogError('INVALID_RESPONSE');
  return value.map((row: any) => {
    const price = Number(row?.base_price);
    if (!row || typeof row.id !== 'string' || typeof row.name !== 'string'
      || !(row.description === null || typeof row.description === 'string')
      || !(row.image_url === null || typeof row.image_url === 'string')
      || !mealTypes.includes(row.meal_type) || !dietTypes.includes(row.diet_type)
      || !Number.isFinite(price) || price <= 0 || typeof row.is_active !== 'boolean'
      || typeof row.created_at !== 'string' || typeof row.updated_at !== 'string') {
      throw new KitchenCatalogError('INVALID_RESPONSE');
    }
    return {
      id: row.id,
      name: row.name,
      description: row.description ?? '',
      imageUrl: row.image_url ?? '',
      mealType: row.meal_type,
      dietType: row.diet_type,
      basePrice: price,
      isActive: row.is_active,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  });
}

const toError = (error: any) => new KitchenCatalogError(error?.code || 'CONNECTION', error?.message);

export const kitchenCatalogService = {
  async list(): Promise<KitchenCatalogMeal[]> {
    const { data, error } = await getSupabaseClient().rpc('get_kitchen_catalog');
    if (error) throw toError(error);
    return parseKitchenCatalog(data);
  },

  async save(input: KitchenCatalogMealInput): Promise<KitchenCatalogMeal[]> {
    const { data, error } = await getSupabaseClient().rpc('save_kitchen_meal', {
      p_meal_id: input.id ?? null,
      p_name: input.name,
      p_description: input.description,
      p_image_url: input.imageUrl,
      p_meal_type: input.mealType,
      p_diet_type: input.dietType,
      p_base_price: input.basePrice,
      p_is_active: input.isActive,
    });
    if (error) throw toError(error);
    return parseKitchenCatalog(data);
  },
};

