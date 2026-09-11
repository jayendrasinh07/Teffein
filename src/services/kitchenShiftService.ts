import { getSupabaseClient } from './supabaseClient';
import type { KitchenShift } from './kitchenService';

export interface KitchenCapacitySlot {
  id: string;
  name: string;
  start_time: string;
  end_time: string;
  max_portions: number;
  booked_portions: number;
  remaining_portions: number;
  utilization_percent: number;
}

export interface KitchenShiftBrief {
  service_date: string;
  meal_type: KitchenShift;
  slots: KitchenCapacitySlot[];
  handover: { note: string; updated_at: string | null; updated_by: string | null };
}

export class KitchenShiftError extends Error {
  code: string;
  constructor(code: string) {
    super(code === '42501' ? 'Kitchen access is unavailable. Sign in with an authorized account.'
      : code === '40001' ? 'Another kitchen user updated this handover. The latest note has been loaded.'
      : code === '22023' ? 'Check the shift note and try again.'
      : 'Shift controls could not be refreshed. Try again.');
    this.code = code;
  }
}

export function parseKitchenShiftBrief(value: unknown): KitchenShiftBrief {
  const brief = value as KitchenShiftBrief;
  if (!brief || typeof brief.service_date !== 'string' || !['breakfast', 'lunch', 'dinner'].includes(brief.meal_type)
    || !Array.isArray(brief.slots) || !brief.handover || typeof brief.handover.note !== 'string'
    || brief.handover.note.length > 2000
    || !(brief.handover.updated_at === null || typeof brief.handover.updated_at === 'string')
    || !(brief.handover.updated_by === null || typeof brief.handover.updated_by === 'string')) {
    throw new KitchenShiftError('INVALID_RESPONSE');
  }
  const slots = brief.slots.map(slot => {
    const max = Number(slot?.max_portions);
    const booked = Number(slot?.booked_portions);
    const remaining = Number(slot?.remaining_portions);
    const utilization = Number(slot?.utilization_percent);
    if (!slot || typeof slot.id !== 'string' || typeof slot.name !== 'string'
      || typeof slot.start_time !== 'string' || typeof slot.end_time !== 'string'
      || !Number.isInteger(max) || max < 0 || !Number.isInteger(booked) || booked < 0
      || !Number.isInteger(remaining) || remaining < 0 || !Number.isFinite(utilization) || utilization < 0) {
      throw new KitchenShiftError('INVALID_RESPONSE');
    }
    return { ...slot, max_portions: max, booked_portions: booked, remaining_portions: remaining, utilization_percent: utilization };
  });
  return { ...brief, slots };
}

export const kitchenShiftService = {
  async get(date: string, shift: KitchenShift) {
    const { data, error } = await getSupabaseClient().rpc('get_kitchen_shift_brief', {
      p_service_date: date, p_meal_type: shift,
    });
    if (error) throw new KitchenShiftError(error.code);
    const brief = parseKitchenShiftBrief(data);
    if (brief.service_date !== date || brief.meal_type !== shift) throw new KitchenShiftError('INVALID_RESPONSE');
    return brief;
  },
  async save(date: string, shift: KitchenShift, note: string, expectedUpdatedAt: string | null) {
    if (note.trim().length > 2000) throw new KitchenShiftError('22023');
    const { data, error } = await getSupabaseClient().rpc('save_kitchen_shift_handover', {
      p_service_date: date,
      p_meal_type: shift,
      p_note: note,
      p_expected_updated_at: expectedUpdatedAt,
    });
    if (error) throw new KitchenShiftError(error.code);
    const brief = parseKitchenShiftBrief(data);
    if (brief.service_date !== date || brief.meal_type !== shift) throw new KitchenShiftError('INVALID_RESPONSE');
    return brief;
  },
};

