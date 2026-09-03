// Generated schema reflects the deployed cloud database; domain CHECK values are kept here.
export type { Database, Json } from './database.generated';

export type UserRoleType = 'customer' | 'admin' | 'kitchen' | 'delivery' | 'corporate';
export type CustomerSegmentType = 'student' | 'worker' | 'corporate' | 'family' | 'individual';
export type AddressLabelType = 'Home' | 'Office' | 'College' | 'PG' | 'Other';
export type InstructionPresetType = 'call_on_reach' | 'leave_at_security' | 'ring_bell' | 'deliver_at_reception' | 'custom';
export type LocationSourceType = 'gps' | 'search' | 'map' | 'saved' | 'manual';
export type MealType = 'lunch' | 'dinner' | 'both' | 'breakfast' | 'snack';
export type OrderStatusType = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'out_for_delivery' | 'delivered' | 'cancelled';
export type PaymentStatusType = 'pending' | 'processing' | 'paid' | 'failed' | 'refunded';

