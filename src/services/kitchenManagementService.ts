import { getSupabaseClient } from './supabaseClient';

export interface ManagedDeliverySlot {
  id: string;
  name: string;
  meal_type: 'lunch' | 'dinner';
  start_time: string;
  end_time: string;
  cutoff_time: string;
  max_portions: number;
  is_active: boolean;
  booked_today: number;
  peak_booked_portions: number;
}

export interface KitchenStaffMember {
  user_id: string;
  full_name: string;
  email: string;
  added_at: string;
}

export interface KitchenManagementDocument {
  payment_mode: 'manual';
  cutoffs: { lunch: string; dinner: string };
  slots: ManagedDeliverySlot[];
  staff: KitchenStaffMember[];
}

export class KitchenManagementError extends Error {
  code: string;
  constructor(code: string) {
    super(code === '42501' ? 'Admin access is required for Management.'
      : code === '23514' ? 'Capacity cannot be lower than portions already booked for a current or future date.'
      : code === 'P0002' ? 'Account or access record was not found. The user must create a Thalimitra account first.'
      : code === '22023' ? 'Check the value and try again.'
      : 'Management could not be refreshed. Try again.');
    this.code = code;
  }
}

export function parseKitchenManagement(value: unknown): KitchenManagementDocument {
  const document = value as KitchenManagementDocument;
  if (!document || document.payment_mode !== 'manual' || !document.cutoffs
    || document.cutoffs.lunch !== '10:30:00' || document.cutoffs.dinner !== '17:30:00'
    || !Array.isArray(document.slots) || !Array.isArray(document.staff)) {
    throw new KitchenManagementError('INVALID_RESPONSE');
  }
  const slots = document.slots.map(slot => {
    const max = Number(slot?.max_portions);
    const today = Number(slot?.booked_today);
    const peak = Number(slot?.peak_booked_portions);
    if (!slot || typeof slot.id !== 'string' || typeof slot.name !== 'string'
      || !['lunch', 'dinner'].includes(slot.meal_type)
      || typeof slot.start_time !== 'string' || typeof slot.end_time !== 'string'
      || typeof slot.cutoff_time !== 'string' || typeof slot.is_active !== 'boolean'
      || !Number.isInteger(max) || max < 0 || max > 5000
      || !Number.isInteger(today) || today < 0 || !Number.isInteger(peak) || peak < 0) {
      throw new KitchenManagementError('INVALID_RESPONSE');
    }
    return { ...slot, max_portions: max, booked_today: today, peak_booked_portions: peak };
  });
  const staff = document.staff.map(member => {
    if (!member || typeof member.user_id !== 'string' || typeof member.full_name !== 'string'
      || typeof member.email !== 'string' || typeof member.added_at !== 'string') {
      throw new KitchenManagementError('INVALID_RESPONSE');
    }
    return member;
  });
  return { ...document, slots, staff };
}

const rpc = async (name: 'get_kitchen_management' | 'save_kitchen_delivery_slot' | 'grant_kitchen_access' | 'revoke_kitchen_access', args?: Record<string, unknown>) => {
  const { data, error } = await getSupabaseClient().rpc(name, args as never);
  if (error) throw new KitchenManagementError(error.code);
  return parseKitchenManagement(data);
};

export const kitchenManagementService = {
  get: () => rpc('get_kitchen_management'),
  saveSlot(slotId: string, maxPortions: number, isActive: boolean) {
    if (!slotId || !Number.isInteger(maxPortions) || maxPortions < 0 || maxPortions > 5000) {
      throw new KitchenManagementError('22023');
    }
    return rpc('save_kitchen_delivery_slot', {
      p_slot_id: slotId, p_max_portions: maxPortions, p_is_active: isActive,
    });
  },
  grantStaff(email: string) {
    const normalized = email.trim().toLowerCase();
    if (!normalized || normalized.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
      throw new KitchenManagementError('22023');
    }
    return rpc('grant_kitchen_access', { p_email: normalized });
  },
  revokeStaff(userId: string) {
    if (!userId) throw new KitchenManagementError('22023');
    return rpc('revoke_kitchen_access', { p_user_id: userId });
  },
};

