import { 
  DeliverySlot, 
  AvailabilityCheckResult, 
  CustomerAddress,
  MealAddOn 
} from '../types';
import { GANDHINAGAR_AREAS } from '../data/config';
import { IMAGES } from '../data/images';

export interface TeffeinConfig {
  lunch: {
    startTime: string; // e.g. "12:00 PM"
    endTime: string;   // e.g. "01:30 PM"
    cutoffTimeHours: number; // 10
    cutoffTimeMinutes: number; // 30
    cutoffLabel: string; // "10:30 AM"
  };
  dinner: {
    startTime: string;
    endTime: string;
    cutoffTimeHours: number; // 16
    cutoffTimeMinutes: number; // 30
    cutoffLabel: string; // "04:30 PM"
  };
  maxAdvanceBookingDays: number;
  closedDates: string[]; // YYYY-MM-DD
  baseOneTimeMealPrice: number;
  freeDeliveryThreshold: number;
  standardDeliveryFee: number;
  defaultSlots: {
    lunch: Omit<DeliverySlot, 'mealSlot'>[];
    dinner: Omit<DeliverySlot, 'mealSlot'>[];
  };
}

export const TEFFEIN_OPERATIONAL_CONFIG: TeffeinConfig = {
  lunch: {
    startTime: '12:00 PM',
    endTime: '01:30 PM',
    cutoffTimeHours: 10,
    cutoffTimeMinutes: 30,
    cutoffLabel: '10:30 AM'
  },
  dinner: {
    startTime: '07:00 PM',
    endTime: '09:00 PM',
    cutoffTimeHours: 17,
    cutoffTimeMinutes: 30,
    cutoffLabel: '05:30 PM'
  },
  maxAdvanceBookingDays: 6,
  closedDates: [],
  baseOneTimeMealPrice: 119,
  freeDeliveryThreshold: 0, // Free cluster delivery in Gandhinagar
  standardDeliveryFee: 0,
  defaultSlots: {
    lunch: [
      { id: 'L-1', windowLabel: '12:00 PM – 12:30 PM', startTime: '12:00 PM', endTime: '12:30 PM', maxCapacity: 45, bookedCount: 28, isASAP: true },
      { id: 'L-2', windowLabel: '12:30 PM – 01:00 PM', startTime: '12:30 PM', endTime: '01:00 PM', maxCapacity: 50, bookedCount: 34 },
      { id: 'L-3', windowLabel: '01:00 PM – 01:30 PM', startTime: '01:00 PM', endTime: '01:30 PM', maxCapacity: 40, bookedCount: 22 }
    ],
    dinner: [
      { id: 'D-1', windowLabel: '07:00 PM – 07:30 PM', startTime: '07:00 PM', endTime: '07:30 PM', maxCapacity: 35, bookedCount: 14, isASAP: true },
      { id: 'D-2', windowLabel: '07:30 PM – 08:00 PM', startTime: '07:30 PM', endTime: '08:00 PM', maxCapacity: 45, bookedCount: 29 },
      { id: 'D-3', windowLabel: '08:00 PM – 08:30 PM', startTime: '08:00 PM', endTime: '08:30 PM', maxCapacity: 40, bookedCount: 19 }
    ]
  }
};

export const AVAILABLE_ADDONS: MealAddOn[] = [
  {
    id: 'addon-chaas',
    name: 'Chilled Masala Chaas (250ml)',
    price: 20,
    category: 'drink',
    description: 'Fresh earthen-churned buttermilk with roasted cumin & fresh mint',
    isPopular: true
  },
  {
    id: 'addon-roti',
    name: '2 Extra Soft Phulka Rotis',
    price: 25,
    category: 'extra_food',
    description: '100% MP Sharbati whole wheat with pure desi ghee brush',
    isPopular: true
  },
  {
    id: 'addon-sweet',
    name: 'Gujarati Sweet Treat (Mohanthal / Shrikhand)',
    price: 35,
    category: 'sweet',
    description: 'Freshly made traditional dessert of the day',
    isPopular: false
  },
  {
    id: 'addon-sabji',
    name: 'Extra Seasonal Sabji Bowl (200g)',
    price: 45,
    category: 'extra_food',
    description: 'Extra portion of hot homestyle dry/gravy vegetable preparation',
    isPopular: false
  },
  {
    id: 'addon-khichdi-kadhi',
    name: 'Extra Gujarati Kadhi Bowl (200ml)',
    price: 30,
    category: 'extra_food',
    description: 'Sweet-sour authentic kadhi with curry leaves and mustard tadka',
    isPopular: false
  }
];

export const SAVED_CUSTOMER_ADDRESSES: CustomerAddress[] = [
  {
    id: 'addr-1',
    label: 'PG',
    fullName: 'Aarav Patel',
    phone: '+91 98254 99120',
    addressLine: 'Room 402, Shivalik Elite Boys PG, Near Swagat Flamingo',
    area: 'Kudasan',
    sector: 'PDPU Knowledge Corridor',
    landmark: 'Behind Reliance Petrol Pump',
    pincode: '382421',
    clusterId: 'cluster-a',
    isServiceable: true
  },
  {
    id: 'addr-2',
    label: 'Office',
    fullName: 'Aarav Patel',
    phone: '+91 98254 99120',
    addressLine: 'Desk 4B, 3rd Floor, Infocity Tower 2',
    area: 'Infocity (Phase 1 & 2)',
    sector: 'Infocity Tech Hub',
    landmark: 'Opposite Infocity Club',
    pincode: '382007',
    clusterId: 'cluster-a',
    isServiceable: true
  }
];

/**
 * Checks if a given pincode or area name in Gandhinagar is serviceable
 */
export function checkServiceability(pincodeOrArea: string): {
  isServiceable: boolean;
  areaName: string;
  clusterId: string;
  clusterName: string;
  pincode: string;
  message: string;
} {
  const query = pincodeOrArea.trim().toLowerCase();
  if (!query) {
    return {
      isServiceable: false,
      areaName: '',
      clusterId: '',
      clusterName: '',
      pincode: '',
      message: 'Please provide a pincode or area name in Gandhinagar.'
    };
  }

  const match = GANDHINAGAR_AREAS.find(
    (a) =>
      a.pincode === query ||
      a.area.toLowerCase().includes(query) ||
      a.sector.toLowerCase().includes(query)
  );

  if (match) {
    const clusterId = match.cluster.toLowerCase().includes('cluster a')
      ? 'cluster-a'
      : match.cluster.toLowerCase().includes('cluster b')
      ? 'cluster-b'
      : match.cluster.toLowerCase().includes('cluster c')
      ? 'cluster-c'
      : 'cluster-d';

    return {
      isServiceable: true,
      areaName: match.area,
      clusterId,
      clusterName: match.cluster,
      pincode: match.pincode,
      message: `TEFFEIN delivers directly to ${match.area} (${match.cluster}) with free cluster doorstep delivery.`
    };
  }

  return {
    isServiceable: false,
    areaName: pincodeOrArea,
    clusterId: '',
    clusterName: '',
    pincode: '',
    message: `We're currently expanding! ${pincodeOrArea} is not yet in our active cluster zone. Leave your number to be notified when delivery launches.`
  };
}

/**
 * Checks availability for a specific Date & Meal Slot with intelligent "Next Available" computation
 */
export function checkMealAvailability(params: {
  date: string; // YYYY-MM-DD
  mealSlot: 'lunch' | 'dinner';
  currentTime?: Date;
}): AvailabilityCheckResult {
  const { date, mealSlot } = params;
  const now = params.currentTime || new Date();
  
  const todayStr = now.toISOString().split('T')[0];
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  const dateObj = new Date(date + 'T00:00:00');
  const isToday = date === todayStr;
  const isTomorrow = date === tomorrowStr;

  const dateLabel = isToday ? 'Today' : isTomorrow ? 'Tomorrow' : dateObj.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' });

  // 1. Check if closed date
  if (TEFFEIN_OPERATIONAL_CONFIG.closedDates.includes(date)) {
    return {
      isAvailable: false,
      reason: 'KITCHEN_CLOSED',
      message: `TEFFEIN kitchen is closed on ${dateLabel} for holiday maintenance.`,
      mealSlot,
      date,
      dateLabel,
      availableSlots: [],
      nextAvailable: {
        date: tomorrowStr,
        dateLabel: 'Tomorrow',
        mealSlot: 'lunch',
        timeWindow: '12:00 PM – 01:30 PM',
        actionLabel: "Order Tomorrow's Lunch"
      }
    };
  }

  // 2. Check if date is in the past
  if (date < todayStr) {
    return {
      isAvailable: false,
      reason: 'DATE_OUT_OF_BOUNDS',
      message: 'Selected date is in the past.',
      mealSlot,
      date,
      dateLabel,
      availableSlots: [],
      nextAvailable: {
        date: todayStr,
        dateLabel: 'Today',
        mealSlot: 'dinner',
        timeWindow: '07:00 PM – 08:30 PM',
        actionLabel: "Order Today's Dinner"
      }
    };
  }

  // 3. Evaluate Cutoff time if ordering for TODAY
  if (isToday) {
    const currentHour = now.getHours();
    const currentMin = now.getMinutes();
    const currentMinutesOfDay = currentHour * 60 + currentMin;

    if (mealSlot === 'lunch') {
      const lunchCutoffMinutes = 
        TEFFEIN_OPERATIONAL_CONFIG.lunch.cutoffTimeHours * 60 + 
        TEFFEIN_OPERATIONAL_CONFIG.lunch.cutoffTimeMinutes;

      if (currentMinutesOfDay > lunchCutoffMinutes) {
        // Today's Lunch Cutoff Passed! Provide Next Available: Dinner (if before dinner cutoff) or Tomorrow's Lunch
        const dinnerCutoffMinutes = 
          TEFFEIN_OPERATIONAL_CONFIG.dinner.cutoffTimeHours * 60 + 
          TEFFEIN_OPERATIONAL_CONFIG.dinner.cutoffTimeMinutes;

        if (currentMinutesOfDay <= dinnerCutoffMinutes) {
          return {
            isAvailable: false,
            reason: 'CUTOFF_PASSED',
            message: `Today's lunch ordering closed at ${TEFFEIN_OPERATIONAL_CONFIG.lunch.cutoffLabel}. The morning cooking batch has already been dispatched.`,
            mealSlot: 'lunch',
            date,
            dateLabel,
            availableSlots: [],
            nextAvailable: {
              date: todayStr,
              dateLabel: 'Today',
              mealSlot: 'dinner',
              timeWindow: '07:00 PM – 08:30 PM',
              actionLabel: "Order Today's Dinner"
            }
          };
        } else {
          return {
            isAvailable: false,
            reason: 'CUTOFF_PASSED',
            message: `Today's lunch ordering closed at ${TEFFEIN_OPERATIONAL_CONFIG.lunch.cutoffLabel}.`,
            mealSlot: 'lunch',
            date,
            dateLabel,
            availableSlots: [],
            nextAvailable: {
              date: tomorrowStr,
              dateLabel: 'Tomorrow',
              mealSlot: 'lunch',
              timeWindow: '12:00 PM – 01:30 PM',
              actionLabel: "Order Tomorrow's Lunch"
            }
          };
        }
      }
    } else if (mealSlot === 'dinner') {
      const dinnerCutoffMinutes = 
        TEFFEIN_OPERATIONAL_CONFIG.dinner.cutoffTimeHours * 60 + 
        TEFFEIN_OPERATIONAL_CONFIG.dinner.cutoffTimeMinutes;

      if (currentMinutesOfDay > dinnerCutoffMinutes) {
        // Today's Dinner Cutoff Passed! Provide Next Available: Tomorrow's Lunch
        return {
          isAvailable: false,
          reason: 'CUTOFF_PASSED',
          message: `Today's dinner ordering closed at ${TEFFEIN_OPERATIONAL_CONFIG.dinner.cutoffLabel}. Fresh evening batches are currently in steam preparation.`,
          mealSlot: 'dinner',
          date,
          dateLabel,
          availableSlots: [],
          nextAvailable: {
            date: tomorrowStr,
            dateLabel: 'Tomorrow',
            mealSlot: 'lunch',
            timeWindow: '12:00 PM – 01:30 PM',
            actionLabel: "Order Tomorrow's Lunch"
          }
        };
      }
    }
  }

  // 4. Return Available delivery slots with remaining capacity
  const baseSlots = mealSlot === 'lunch' 
    ? TEFFEIN_OPERATIONAL_CONFIG.defaultSlots.lunch 
    : TEFFEIN_OPERATIONAL_CONFIG.defaultSlots.dinner;

  const mappedSlots: DeliverySlot[] = baseSlots.map((s) => ({
    ...s,
    mealSlot
  }));

  return {
    isAvailable: true,
    message: `${dateLabel}'s ${mealSlot} is open for fresh preparation! Select your preferred delivery window.`,
    mealSlot,
    date,
    dateLabel,
    availableSlots: mappedSlots
  };
}

/**
 * Returns available orderable dates list (e.g. Today, Tomorrow, and next 5 days)
 */
export function getOrderableDates(): { dateStr: string; label: string; subLabel: string; isToday: boolean }[] {
  const dates = [];
  const now = new Date();

  for (let i = 0; i <= TEFFEIN_OPERATIONAL_CONFIG.maxAdvanceBookingDays; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() + i);
    const dateStr = d.toISOString().split('T')[0];
    const isToday = i === 0;
    const isTomorrow = i === 1;
    const label = isToday ? 'Today' : isTomorrow ? 'Tomorrow' : d.toLocaleDateString('en-IN', { weekday: 'short' });
    const subLabel = d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });

    dates.push({
      dateStr,
      label,
      subLabel,
      isToday
    });
  }

  return dates;
}
