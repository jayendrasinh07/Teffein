import { DayMenu, MenuItem, MealSlot } from '../types';
import { WEEKLY_MENU } from '../data/config';
import { IMAGES } from '../data/images';

export interface SingleMealCustomization {
  mealIndex: number;
  label: string; // e.g. "Meal 1 — Self"
  rotiCount: number; // Default 4, range 2 to 8
  ricePortion: 'regular' | 'extra' | 'none';
  sabjiPortion: 'regular' | 'extra';
  dalPortion: 'regular' | 'extra';
  saladIncluded: boolean;
  extraSalad: boolean;
  hasChaas: boolean;
  dietVariant: 'Standard Gujarati' | 'Jain Satvik' | 'Kathiyawadi' | 'No Onion-Garlic';
  spiceLevel: 'Regular' | 'Less Spicy';
  oilLevel: 'Standard' | 'Less Oil (Fit)';
  specialNote?: string;
}

export interface StandaloneAddOn {
  id: string;
  name: string;
  price: number;
  quantity: number;
  category: 'drink' | 'extra_food' | 'sweet';
  image?: string;
  unit: string;
}

export interface OrderPricingBreakdown {
  basePricePerMeal: number;
  quantity: number;
  mealsSubtotal: number;
  customizationsTotal: number;
  addOnsTotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  customizationLineItems: { label: string; amount: number }[];
  addOnLineItems: { name: string; qty: number; unitPrice: number; total: number }[];
}

export interface DayMealDetails {
  dayName: string;
  mealSlot: 'lunch' | 'dinner';
  title: string;
  chefNote: string;
  image: string;
  dishes: {
    sabji: MenuItem[];
    dal: MenuItem[];
    roti: MenuItem[];
    rice: MenuItem[];
    salad: MenuItem[];
    beverage?: MenuItem[];
    sweet?: MenuItem[];
  };
  nutrition: {
    calories: number;
    proteinGrams: number;
    carbsGrams: number;
    fatGrams: number;
    fiberGrams: number;
    oilLevel: string;
  };
}

// Addon catalog for smart ordering
export const ORDER_ADDON_CATALOG: Omit<StandaloneAddOn, 'quantity'>[] = [
  {
    id: 'addon-chaas',
    name: 'Chilled Masala Chaas (250ml)',
    price: 15,
    category: 'drink',
    unit: 'Bottle',
    image: IMAGES.dishes.chaas
  },
  {
    id: 'addon-roti-pair',
    name: '2 Extra Soft Phulka Rotis',
    price: 20,
    category: 'extra_food',
    unit: 'Pair',
    image: IMAGES.dishes.phulka
  },
  {
    id: 'addon-sweet-shrikhand',
    name: 'Mohanthal / Shrikhand Cup',
    price: 35,
    category: 'sweet',
    unit: 'Cup',
    image: IMAGES.dishes.dessert
  },
  {
    id: 'addon-extra-sabji',
    name: 'Extra Sabji Bowl (200g)',
    price: 30,
    category: 'extra_food',
    unit: 'Bowl',
    image: IMAGES.dishes.sabjiGravy
  },
  {
    id: 'addon-extra-dal',
    name: 'Extra Dal / Kadhi Bowl (200ml)',
    price: 20,
    category: 'extra_food',
    unit: 'Bowl',
    image: IMAGES.dishes.dalTadka
  },
  {
    id: 'addon-papad-pickle',
    name: 'Roasted Papad & Mango Pickle',
    price: 15,
    category: 'extra_food',
    unit: 'Set',
    image: IMAGES.dishes.salad
  }
];

// Default single meal customization
export function createDefaultMealCustomization(index: number = 0, label: string = 'Meal 1'): SingleMealCustomization {
  return {
    mealIndex: index,
    label,
    rotiCount: 4, // 4 included
    ricePortion: 'regular',
    sabjiPortion: 'regular',
    dalPortion: 'regular',
    saladIncluded: true,
    extraSalad: false,
    hasChaas: false,
    dietVariant: 'Standard Gujarati',
    spiceLevel: 'Regular',
    oilLevel: 'Standard',
    specialNote: ''
  };
}

// Retrieve day menu & rich details from date string
export function getMealDetailsForDate(dateStr: string, slot: 'lunch' | 'dinner'): DayMealDetails {
  const dateObj = new Date(dateStr + 'T00:00:00');
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayName = isNaN(dateObj.getDay()) ? 'Monday' : dayNames[dateObj.getDay()];

  const dayMenu = WEEKLY_MENU.find((m) => m.dayOfWeek === dayName) || WEEKLY_MENU[0];
  const slotData = slot === 'lunch' ? dayMenu.lunch : dayMenu.dinner;

  // Classify items by category
  const sabji = slotData.items.filter((i) => i.category === 'sabji');
  const dal = slotData.items.filter((i) => i.category === 'dal_kadhi');
  const roti = slotData.items.filter((i) => i.category === 'roti_bread');
  const rice = slotData.items.filter((i) => i.category === 'rice_khichdi');
  const salad = slotData.items.filter((i) => i.category === 'salad_kachumber');
  const beverage = slotData.items.filter((i) => i.category === 'beverage');
  const sweet = slotData.items.filter((i) => i.category === 'sweet');

  // Choose appropriate photography based on day & slot
  let image = IMAGES.hero.mainThali;
  if (dayName === 'Sunday') {
    image = IMAGES.hero.thaliSpread;
  } else if (dayName === 'Thursday') {
    image = IMAGES.hero.mainThali;
  } else if (dayName === 'Wednesday') {
    image = IMAGES.hero.thaliSpread;
  } else if (dayName === 'Saturday') {
    image = IMAGES.hero.mainThali;
  }

  return {
    dayName,
    mealSlot: slot,
    title: slotData.title || `${dayName} Home-Style Thali`,
    chefNote: slotData.chefNote || 'Cooked fresh in cold-pressed groundnut oil with zero soda.',
    image,
    dishes: {
      sabji,
      dal,
      roti,
      rice,
      salad,
      beverage,
      sweet
    },
    nutrition: slotData.nutrition
  };
}

// Reactive centralized price calculation
export function calculateOrderPrice(params: {
  basePricePerMeal?: number;
  quantity: number;
  applySameCustomization: boolean;
  mealCustomizations: SingleMealCustomization[];
  selectedAddons: { [id: string]: number };
  deliveryFee?: number;
  discount?: number;
}): OrderPricingBreakdown {
  const basePrice = params.basePricePerMeal ?? 119;
  const qty = Math.max(1, params.quantity);
  const mealsSubtotal = basePrice * qty;

  const customizationLineItems: { label: string; amount: number }[] = [];
  let customizationsTotal = 0;

  // Compute customizations cost
  const customList = params.applySameCustomization
    ? [params.mealCustomizations[0] || createDefaultMealCustomization(0)]
    : params.mealCustomizations.slice(0, qty);

  const multiplier = params.applySameCustomization ? qty : 1;

  customList.forEach((c, idx) => {
    const mealLabel = params.applySameCustomization && qty > 1 ? `All ${qty} Meals` : (c.label || `Meal ${idx + 1}`);

    // Extra Roti pricing: 4 included. Extra rotis are ₹10 each
    if (c.rotiCount > 4) {
      const extraRotis = (c.rotiCount - 4) * multiplier;
      const extraCost = (c.rotiCount - 4) * 10 * multiplier;
      customizationsTotal += extraCost;
      customizationLineItems.push({
        label: `${mealLabel}: +${extraRotis} Extra Rotis`,
        amount: extraCost
      });
    }

    // Extra Rice: +₹15
    if (c.ricePortion === 'extra') {
      const extraCost = 15 * multiplier;
      customizationsTotal += extraCost;
      customizationLineItems.push({
        label: `${mealLabel}: Extra Rice Portion`,
        amount: extraCost
      });
    }

    // Extra Sabji: +₹25
    if (c.sabjiPortion === 'extra') {
      const extraCost = 25 * multiplier;
      customizationsTotal += extraCost;
      customizationLineItems.push({
        label: `${mealLabel}: Extra Sabji Portion`,
        amount: extraCost
      });
    }

    // Extra Dal: +₹15
    if (c.dalPortion === 'extra') {
      const extraCost = 15 * multiplier;
      customizationsTotal += extraCost;
      customizationLineItems.push({
        label: `${mealLabel}: Extra Dal Portion`,
        amount: extraCost
      });
    }

    // Extra Salad: +₹10
    if (c.extraSalad) {
      const extraCost = 10 * multiplier;
      customizationsTotal += extraCost;
      customizationLineItems.push({
        label: `${mealLabel}: Extra Salad Portion`,
        amount: extraCost
      });
    }

    // Direct Chaas in meal: +₹15
    if (c.hasChaas) {
      const extraCost = 15 * multiplier;
      customizationsTotal += extraCost;
      customizationLineItems.push({
        label: `${mealLabel}: Fresh Masala Chaas`,
        amount: extraCost
      });
    }
  });

  // Standalone Add-ons
  const addOnLineItems: { name: string; qty: number; unitPrice: number; total: number }[] = [];
  let addOnsTotal = 0;

  Object.entries(params.selectedAddons).forEach(([id, count]) => {
    const addon = ORDER_ADDON_CATALOG.find((a) => a.id === id);
    if (addon && count > 0) {
      const itemTotal = addon.price * count;
      addOnsTotal += itemTotal;
      addOnLineItems.push({
        name: addon.name,
        qty: count,
        unitPrice: addon.price,
        total: itemTotal
      });
    }
  });

  const deliveryFee = params.deliveryFee ?? 0;
  const discount = params.discount ?? 0;
  const total = Math.max(0, mealsSubtotal + customizationsTotal + addOnsTotal + deliveryFee - discount);

  return {
    basePricePerMeal: basePrice,
    quantity: qty,
    mealsSubtotal,
    customizationsTotal,
    addOnsTotal,
    deliveryFee,
    discount,
    total,
    customizationLineItems,
    addOnLineItems
  };
}
