import { getSupabaseClient } from './supabaseClient';

export type SupportCategory = 'order_help' | 'cancellation_help' | 'delivery_help' | 'menu_question' | 'account_help' | 'corporate' | 'other';
export type SupportStatus = 'open' | 'in_progress' | 'resolved';

export interface SupportRequest {
  id: string;
  order_id: string | null;
  order_number?: string | null;
  category: SupportCategory;
  message: string;
  status: SupportStatus;
  created_at: string;
  updated_at: string;
}

export interface KitchenSupportRequest extends SupportRequest {
  customer_name: string;
  customer_email: string;
  customer_phone: string;
}

export class SupportError extends Error {
  readonly code: string;

  constructor(code: string) {
    super(code === '42501' ? 'Sign in with the required account access.'
      : code === 'P0002' ? 'The selected order or support request was not found.'
      : code === '23514' ? 'Please wait for an existing request to be resolved.'
      : code === '22023' ? 'Check the topic and message, then try again.'
      : 'Support could not be reached. Try again.');
    this.code = code;
  }
}

const categories: SupportCategory[] = ['order_help', 'cancellation_help', 'delivery_help', 'menu_question', 'account_help', 'corporate', 'other'];
const statuses: SupportStatus[] = ['open', 'in_progress', 'resolved'];

const parseRequest = (value: unknown, kitchen = false): SupportRequest | KitchenSupportRequest => {
  const request = value as KitchenSupportRequest;
  if (!request || typeof request.id !== 'string' || !categories.includes(request.category)
    || typeof request.message !== 'string' || request.message.length < 10 || request.message.length > 2000
    || !statuses.includes(request.status) || typeof request.created_at !== 'string' || typeof request.updated_at !== 'string'
    || (request.order_id !== null && typeof request.order_id !== 'string')
    || (kitchen && (typeof request.customer_name !== 'string' || typeof request.customer_email !== 'string' || typeof request.customer_phone !== 'string'))) {
    throw new SupportError('INVALID_RESPONSE');
  }
  return request;
};

export const parseSupportRequests = (value: unknown, kitchen = false) => {
  if (!Array.isArray(value)) throw new SupportError('INVALID_RESPONSE');
  return value.map(request => parseRequest(request, kitchen));
};

export const supportService = {
  async create(category: SupportCategory, message: string, orderId: string | null = null): Promise<SupportRequest> {
    const clean = message.trim();
    if (!categories.includes(category) || clean.length < 10 || clean.length > 2000) throw new SupportError('22023');
    const { data, error } = await getSupabaseClient().rpc('create_support_request', {
      p_category: category, p_message: clean, p_order_id: orderId,
    });
    if (error) throw new SupportError(error.code);
    return parseRequest(data) as SupportRequest;
  },
  async getMine(): Promise<SupportRequest[]> {
    const { data, error } = await getSupabaseClient().rpc('get_my_support_requests');
    if (error) throw new SupportError(error.code);
    return parseSupportRequests(data) as SupportRequest[];
  },
  async getKitchen(): Promise<KitchenSupportRequest[]> {
    const { data, error } = await getSupabaseClient().rpc('get_kitchen_support_requests');
    if (error) throw new SupportError(error.code);
    return parseSupportRequests(data, true) as KitchenSupportRequest[];
  },
  async updateKitchen(requestId: string, status: SupportStatus): Promise<KitchenSupportRequest[]> {
    if (!requestId || !statuses.includes(status)) throw new SupportError('22023');
    const { data, error } = await getSupabaseClient().rpc('update_kitchen_support_request', {
      p_request_id: requestId, p_status: status,
    });
    if (error) throw new SupportError(error.code);
    return parseSupportRequests(data, true) as KitchenSupportRequest[];
  },
};

