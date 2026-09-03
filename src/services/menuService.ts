import { getSupabaseClient, isSupabaseConfigured } from './supabaseClient';
import { MealType } from '../types/database.types';

export interface DatabaseMeal {
  id: string;
  name: string;
  description: string;
  imageUrl?: string;
  mealType: MealType;
  dietType: string;
  basePrice: number;
  isActive: boolean;
}

export interface DatabaseMealCustomization {
  id: string;
  mealId?: string | null;
  name: string;
  description?: string;
  price: number;
  isActive: boolean;
}

export interface DatabaseDeliverySlot {
  id: string;
  name: string;
  mealType: 'lunch' | 'dinner';
  startTime: string;
  endTime: string;
  maxOrders: number;
  cutoffTime?: string | null;
  isActive: boolean;
}

export interface DatabaseDayMenu {
  id: string;
  menuDate: string;
  isPublished: boolean;
  meals: DatabaseMeal[];
}

// Fallback Default Customizations (ensuring DB prices match initial seed)
export const DEFAULT_DB_CUSTOMIZATIONS: DatabaseMealCustomization[] = [
  {
    id: 'cust-roti-2',
    name: 'Extra Phulka Roti (Set of 2)',
    description: 'Freshly rolled 100% whole wheat tawa rotis lightly brushed with pure A2 cow ghee',
    price: 15.00,
    isActive: true
  },
  {
    id: 'cust-sabji-1',
    name: 'Extra Sabji Portion (150ml)',
    description: 'Freshly prepared seasonal green vegetable or paneer sabji with cold-pressed groundnut oil',
    price: 35.00,
    isActive: true
  },
  {
    id: 'cust-dal-1',
    name: 'Extra Dal / Kadhi (150ml)',
    description: 'Traditional slow-simmered Gujarati Tuver Dal or sweet-sour Gujarati Kadhi',
    price: 25.00,
    isActive: true
  },
  {
    id: 'cust-chaas-1',
    name: 'Chilled Masala Chaas (200ml)',
    description: 'Fresh daily probiotic buttermilk infused with roasted cumin, rock salt, and mint',
    price: 15.00,
    isActive: true
  },
  {
    id: 'cust-sweet-1',
    name: 'Sweet of the Day',
    description: 'Traditional artisanal Gujarati sweet (Sukhadi / Mohanthal / Shrikhand)',
    price: 30.00,
    isActive: true
  },
  {
    id: 'cust-salad-1',
    name: 'Fresh Green Salad & Lemon Bowl',
    description: 'Crisp cucumber, tomato, carrot, beetroot with fresh lemon wedge and green chilli',
    price: 20.00,
    isActive: true
  }
];

// Fallback Default Delivery Slots
export const DEFAULT_DB_DELIVERY_SLOTS: DatabaseDeliverySlot[] = [
  {
    id: 'slot-lunch-1',
    name: 'Lunch Slot 1 (Early Batch - Campuses & Tech)',
    mealType: 'lunch',
    startTime: '12:00',
    endTime: '12:45',
    maxOrders: 200,
    cutoffTime: '10:30',
    isActive: true
  },
  {
    id: 'slot-lunch-2',
    name: 'Lunch Slot 2 (Prime Batch - Sectors 1–30 & GIFT)',
    mealType: 'lunch',
    startTime: '12:45',
    endTime: '13:30',
    maxOrders: 250,
    cutoffTime: '11:15',
    isActive: true
  },
  {
    id: 'slot-dinner-1',
    name: 'Dinner Slot 1 (Early Evening Batch)',
    mealType: 'dinner',
    startTime: '19:30',
    endTime: '20:15',
    maxOrders: 200,
    cutoffTime: '17:30',
    isActive: true
  },
  {
    id: 'slot-dinner-2',
    name: 'Dinner Slot 2 (Night Batch - Tech Workers & Students)',
    mealType: 'dinner',
    startTime: '20:15',
    endTime: '21:00',
    maxOrders: 250,
    cutoffTime: '18:15',
    isActive: true
  }
];

// Fallback Default Meals
export const DEFAULT_DB_MEALS: DatabaseMeal[] = [
  {
    id: 'meal-exec-lunch',
    name: 'Gandhinagar Executive Thali (Lunch)',
    description: 'Balanced home-style Gujarati lunch: 4 Phulka Rotis, 1 Dry Sabji, 1 Gravy Sabji, Gujarati Tuver Dal, Steamed Rice, Salad, and Chaas.',
    mealType: 'lunch',
    dietType: 'standard_gujarati',
    basePrice: 119.00,
    isActive: true
  },
  {
    id: 'meal-khichdi-dinner',
    name: 'Light Evening Khichdi & Kadhi Bowl (Dinner)',
    description: 'Comforting night dinner: Slow-cooked Moong Dal Khichdi with pure cow ghee, Gujarati Kadhi, Bataka Nu Shaak, Papad, and Pickle.',
    mealType: 'dinner',
    dietType: 'standard_gujarati',
    basePrice: 109.00,
    isActive: true
  },
  {
    id: 'meal-jain-lunch',
    name: 'Jain Satvik Executive Thali',
    description: 'Strictly Jain lunch: No onion, garlic, or root vegetables. 4 Tawa Phulkas, Dudhi Chana Dal, Paneer Makhani (Jain), Jain Dal, Rice, and Sweet Curd.',
    mealType: 'lunch',
    dietType: 'jain_satvik',
    basePrice: 119.00,
    isActive: true
  },
  {
    id: 'meal-kathi-dinner',
    name: 'Kathiyawadi Desi Thali (Dinner)',
    description: 'Hearty rustic meal: 2 Ringna No Olo, 2 Bajra Rotla with pure white butter (Makhan), Desi Jaggery, Garlic Chutney, and Chaas.',
    mealType: 'dinner',
    dietType: 'kathiyawadi',
    basePrice: 129.00,
    isActive: true
  }
];

export const menuService = {
  /**
   * Fetches active meals catalog from Supabase
   */
  async getActiveMeals(): Promise<DatabaseMeal[]> {
    if (!isSupabaseConfigured()) {
      return DEFAULT_DB_MEALS;
    }

    try {
      const client = getSupabaseClient();
      const { data, error } = await client
        .from('meals')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error || !data || data.length === 0) {
        return DEFAULT_DB_MEALS;
      }

      return (data as any[]).map((row) => ({
        id: row.id,
        name: row.name,
        description: row.description || '',
        imageUrl: row.image_url || undefined,
        mealType: row.meal_type as MealType,
        dietType: row.diet_type || 'standard_gujarati',
        basePrice: Number(row.base_price) || 119,
        isActive: row.is_active
      }));
    } catch (err) {
      console.warn('[TEFFEIN Menu] Failed to fetch meals from Supabase, using catalog fallback:', err);
      return DEFAULT_DB_MEALS;
    }
  },

  /**
   * Fetches meal customizations from Supabase (prices authoritative from DB)
   */
  async getMealCustomizations(mealId?: string): Promise<DatabaseMealCustomization[]> {
    if (!isSupabaseConfigured()) {
      return DEFAULT_DB_CUSTOMIZATIONS;
    }

    try {
      const client = getSupabaseClient();
      let query = client
        .from('meal_customizations')
        .select('*')
        .eq('is_active', true);

      if (mealId) {
        query = query.or(`meal_id.is.null,meal_id.eq.${mealId}`);
      }

      const { data, error } = await query.order('price', { ascending: true });

      if (error || !data || data.length === 0) {
        return DEFAULT_DB_CUSTOMIZATIONS;
      }

      return (data as any[]).map((row) => ({
        id: row.id,
        mealId: row.meal_id || null,
        name: row.name,
        description: row.description || '',
        price: Number(row.price) || 0,
        isActive: row.is_active
      }));
    } catch (err) {
      console.warn('[TEFFEIN Menu] Failed to fetch customizations from Supabase, using defaults:', err);
      return DEFAULT_DB_CUSTOMIZATIONS;
    }
  },

  /**
   * Fetches active delivery slots from Supabase for a given meal type (lunch/dinner)
   */
  async getDeliverySlots(mealType?: 'lunch' | 'dinner'): Promise<DatabaseDeliverySlot[]> {
    if (!isSupabaseConfigured()) {
      if (!mealType) return DEFAULT_DB_DELIVERY_SLOTS;
      return DEFAULT_DB_DELIVERY_SLOTS.filter(s => s.mealType === mealType);
    }

    try {
      const client = getSupabaseClient();
      let query = client
        .from('delivery_slots')
        .select('*')
        .eq('is_active', true);

      if (mealType) {
        query = query.eq('meal_type', mealType);
      }

      const { data, error } = await query.order('start_time', { ascending: true });

      if (error || !data || data.length === 0) {
        if (!mealType) return DEFAULT_DB_DELIVERY_SLOTS;
        return DEFAULT_DB_DELIVERY_SLOTS.filter(s => s.mealType === mealType);
      }

      return (data as any[]).map((row) => ({
        id: row.id,
        name: row.name,
        mealType: row.meal_type as 'lunch' | 'dinner',
        startTime: row.start_time,
        endTime: row.end_time,
        maxOrders: row.max_orders || 150,
        cutoffTime: row.cutoff_time || null,
        isActive: row.is_active
      }));
    } catch (err) {
      console.warn('[TEFFEIN Menu] Failed to fetch delivery slots from Supabase:', err);
      if (!mealType) return DEFAULT_DB_DELIVERY_SLOTS;
      return DEFAULT_DB_DELIVERY_SLOTS.filter(s => s.mealType === mealType);
    }
  },

  /**
   * Fetches published day menu for a specific calendar date
   */
  async getMenuForDate(dateStr: string): Promise<DatabaseDayMenu | null> {
    if (!isSupabaseConfigured()) {
      return null;
    }

    try {
      const client = getSupabaseClient();
      const { data: dayRow, error: dayErr } = await client
        .from('menu_days')
        .select('id, menu_date, is_published')
        .eq('menu_date', dateStr)
        .eq('is_published', true)
        .single();

      if (dayErr || !dayRow) {
        return null;
      }

      const { data: items, error: itemsErr } = await client
        .from('menu_items')
        .select(`
          meal_id,
          availability,
          display_order,
          meals (*)
        `)
        .eq('menu_day_id', (dayRow as any).id)
        .eq('availability', true)
        .order('display_order', { ascending: true });

      if (itemsErr || !items) {
        return {
          id: (dayRow as any).id,
          menuDate: (dayRow as any).menu_date,
          isPublished: (dayRow as any).is_published,
          meals: []
        };
      }

      const mappedMeals: DatabaseMeal[] = (items as any[])
        .filter((item) => item.meals)
        .map((item) => ({
          id: item.meals.id,
          name: item.meals.name,
          description: item.meals.description || '',
          imageUrl: item.meals.image_url || undefined,
          mealType: item.meals.meal_type as MealType,
          dietType: item.meals.diet_type || 'standard_gujarati',
          basePrice: Number(item.meals.base_price) || 119,
          isActive: item.meals.is_active
        }));

      return {
        id: (dayRow as any).id,
        menuDate: (dayRow as any).menu_date,
        isPublished: (dayRow as any).is_published,
        meals: mappedMeals
      };
    } catch (err) {
      console.warn('[TEFFEIN Menu] Failed to fetch menu for date:', err);
      return null;
    }
  }
};
