import { getSupabaseClient } from './supabaseClient';

export interface AnalyticsSummary {
  total_orders: number; active_orders: number; cancelled_orders: number; cancellation_rate: number;
  total_portions: number; booked_value: number; average_order_value: number; paid_value: number; pending_value: number;
}
export interface DailyAnalytics { date: string; orders: number; cancelled: number; portions: number; booked_value: number }
export interface StatusAnalytics { status: string; orders: number }
export interface MealTypeAnalytics { meal_type: 'lunch' | 'dinner'; orders: number; portions: number }
export interface PaymentAnalytics { payment_status: string; orders: number; value: number }
export interface TopMealAnalytics { meal_name: string; portions: number }
export interface KitchenAnalyticsDocument {
  start_date: string; end_date: string; generated_at: string; summary: AnalyticsSummary;
  daily: DailyAnalytics[]; statuses: StatusAnalytics[]; meal_types: MealTypeAnalytics[];
  payments: PaymentAnalytics[]; top_meals: TopMealAnalytics[];
}

export class KitchenAnalyticsError extends Error {
  code: string;
  constructor(code: string) {
    super(code === '42501' ? 'MFA-verified admin access is required for reports.'
      : code === '22023' ? 'Choose a valid report range of up to 93 days.'
      : 'Business report could not be loaded. Try again.');
    this.code = code;
  }
}

const number = (value: unknown) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) throw new KitchenAnalyticsError('INVALID_RESPONSE');
  return parsed;
};
const date = (value: unknown) => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value);

export function parseKitchenAnalytics(value: unknown): KitchenAnalyticsDocument {
  const report = value as KitchenAnalyticsDocument;
  if (!report || !date(report.start_date) || !date(report.end_date) || typeof report.generated_at !== 'string'
    || !report.summary || !Array.isArray(report.daily) || !Array.isArray(report.statuses)
    || !Array.isArray(report.meal_types) || !Array.isArray(report.payments) || !Array.isArray(report.top_meals)) {
    throw new KitchenAnalyticsError('INVALID_RESPONSE');
  }
  const summaryKeys: Array<keyof AnalyticsSummary> = ['total_orders', 'active_orders', 'cancelled_orders', 'cancellation_rate', 'total_portions', 'booked_value', 'average_order_value', 'paid_value', 'pending_value'];
  const summary = Object.fromEntries(summaryKeys.map(key => [key, number(report.summary[key])])) as unknown as AnalyticsSummary;
  const daily = report.daily.map(row => {
    if (!date(row?.date)) throw new KitchenAnalyticsError('INVALID_RESPONSE');
    return { ...row, orders: number(row.orders), cancelled: number(row.cancelled), portions: number(row.portions), booked_value: number(row.booked_value) };
  });
  const statuses = report.statuses.map(row => {
    if (!row || typeof row.status !== 'string') throw new KitchenAnalyticsError('INVALID_RESPONSE');
    return { ...row, orders: number(row.orders) };
  });
  const meal_types = report.meal_types.map(row => {
    if (!row || !['lunch', 'dinner'].includes(row.meal_type)) throw new KitchenAnalyticsError('INVALID_RESPONSE');
    return { ...row, orders: number(row.orders), portions: number(row.portions) };
  });
  const payments = report.payments.map(row => {
    if (!row || typeof row.payment_status !== 'string') throw new KitchenAnalyticsError('INVALID_RESPONSE');
    return { ...row, orders: number(row.orders), value: number(row.value) };
  });
  const top_meals = report.top_meals.map(row => {
    if (!row || typeof row.meal_name !== 'string') throw new KitchenAnalyticsError('INVALID_RESPONSE');
    return { ...row, portions: number(row.portions) };
  });
  return { ...report, summary, daily, statuses, meal_types, payments, top_meals };
}

const validDate = (value: string) => /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(`${value}T00:00:00Z`));

export const kitchenAnalyticsService = {
  async get(startDate: string, endDate: string): Promise<KitchenAnalyticsDocument> {
    const days = (Date.parse(`${endDate}T00:00:00Z`) - Date.parse(`${startDate}T00:00:00Z`)) / 86_400_000;
    if (!validDate(startDate) || !validDate(endDate) || days < 0 || days > 92) throw new KitchenAnalyticsError('22023');
    const { data, error } = await getSupabaseClient().rpc('get_kitchen_business_analytics', {
      p_start_date: startDate, p_end_date: endDate,
    });
    if (error) throw new KitchenAnalyticsError(error.code);
    return parseKitchenAnalytics(data);
  },
};
