import { OneTimeOrder } from '../types';
import { IMAGES } from './images';
import { SAVED_CUSTOMER_ADDRESSES } from '../services/availabilityEngine';

export const INITIAL_ONE_TIME_ORDERS: OneTimeOrder[] = [
  {
    id: 'TF10284',
    userId: 'USR-892',
    userName: 'Aarav Patel',
    userPhone: '+91 98254 99120',
    orderType: 'ONE_TIME',
    mealId: 'MEAL-GUJ-STD',
    mealName: 'Regular TEFFEIN Gujarati Thali',
    mealImage: IMAGES.hero.mainThali,
    scheduledDate: '2026-08-23',
    scheduledDateLabel: 'Today',
    mealSlot: 'lunch',
    deliverySlotId: 'L-2',
    deliverySlotLabel: '12:30 PM – 01:00 PM',
    quantity: 1,
    customizations: {
      spiceLevel: 'Regular',
      oilLevel: 'Standard',
      dietVariant: 'Standard Gujarati'
    },
    addOns: [
      {
        id: 'addon-chaas',
        name: 'Chilled Masala Chaas (250ml)',
        price: 20,
        quantity: 1
      },
      {
        id: 'addon-roti',
        name: '2 Extra Soft Phulka Rotis',
        price: 25,
        quantity: 1
      }
    ],
    address: SAVED_CUSTOMER_ADDRESSES[0],
    subtotal: 119,
    addOnsTotal: 45,
    deliveryFee: 0,
    discount: 0,
    total: 164,
    paymentMethod: 'UPI',
    paymentStatus: 'PAID',
    orderStatus: 'OUT_FOR_DELIVERY',
    estimatedDeliveryTime: '12:45 PM',
    createdAt: '10:15 AM, Today',
    traceabilityMealId: 'GDM-2841'
  },
  {
    id: 'TF10240',
    userId: 'USR-892',
    userName: 'Aarav Patel',
    userPhone: '+91 98254 99120',
    orderType: 'ONE_TIME',
    mealId: 'MEAL-KATH-STD',
    mealName: 'Kathiyawadi Ringan Olo & Sev Tameta Thali',
    mealImage: IMAGES.dishes.sabjiDry,
    scheduledDate: '2026-08-22',
    scheduledDateLabel: 'Yesterday',
    mealSlot: 'dinner',
    deliverySlotId: 'D-2',
    deliverySlotLabel: '07:30 PM – 08:00 PM',
    quantity: 1,
    customizations: {
      spiceLevel: 'Less Spicy',
      oilLevel: 'Less Oil (Fit)',
      dietVariant: 'Kathiyawadi'
    },
    addOns: [
      {
        id: 'addon-chaas',
        name: 'Chilled Masala Chaas (250ml)',
        price: 20,
        quantity: 1
      }
    ],
    address: SAVED_CUSTOMER_ADDRESSES[0],
    subtotal: 119,
    addOnsTotal: 20,
    deliveryFee: 0,
    discount: 0,
    total: 139,
    paymentMethod: 'UPI',
    paymentStatus: 'PAID',
    orderStatus: 'DELIVERED',
    estimatedDeliveryTime: '07:48 PM',
    createdAt: '03:30 PM, Yesterday',
    traceabilityMealId: 'GDM-2834'
  }
];
