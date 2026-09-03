import { getSupabaseClient, isSupabaseConfigured } from './supabaseClient';
import { DeliveryAddress, DeliveryZone, AreaWaitlistEntry } from '../types';
import { 
  getSavedAddresses, 
  saveAddressesToStorage, 
  DEFAULT_SAVED_ADDRESSES,
  calculateDeliveryFeeForZone,
  DELIVERY_ZONES 
} from './locationService';

export const addressService = {
  /**
   * Fetches all delivery addresses for a user from Supabase or localStorage
   */
  async getUserAddresses(userId?: string): Promise<DeliveryAddress[]> {
    if (!isSupabaseConfigured() || !userId) {
      return getSavedAddresses();
    }

    try {
      const client = getSupabaseClient();
      const { data, error } = await client
        .from('addresses')
        .select('*')
        .eq('user_id', userId)
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (!data || data.length === 0) {
        return getSavedAddresses();
      }

      const mapped: DeliveryAddress[] = (data as any[]).map((item) => ({
        id: item.id,
        userId: item.user_id,
        label: item.label as any,
        customLabel: item.custom_label || undefined,
        name: item.recipient_name,
        fullName: item.recipient_name,
        phone: item.recipient_phone,
        houseNumber: item.house_flat_number || undefined,
        building: item.building_name || undefined,
        landmark: item.landmark || undefined,
        addressLine1: `${item.house_flat_number ? `${item.house_flat_number}, ` : ''}${item.building_name ? `${item.building_name}, ` : ''}${item.area}, ${item.city}`,
        addressLine: `${item.house_flat_number ? `${item.house_flat_number}, ` : ''}${item.building_name ? `${item.building_name}, ` : ''}${item.area}, ${item.city}`,
        area: item.area,
        sector: item.sector || item.area,
        city: item.city,
        state: item.state,
        pincode: item.pincode,
        latitude: item.latitude || undefined,
        longitude: item.longitude || undefined,
        accuracy: item.gps_accuracy || undefined,
        placeId: item.place_id || undefined,
        source: item.source as any,
        instructions: item.delivery_instructions || undefined,
        instructionPreset: (item.instruction_preset as any) || 'call_on_reach',
        isDefault: item.is_default,
        clusterId: item.cluster_id || 'cluster-a',
        zoneId: (item.zone_id as any) || 'zone_a_core',
        deliveryFee: calculateDeliveryFeeForZone(item.zone_id || 'zone_a_core'),
        isServiceable: item.is_serviceable,
        createdAt: item.created_at,
        updatedAt: item.updated_at
      }));

      // Cache locally for instant next load
      saveAddressesToStorage(mapped);
      return mapped;
    } catch (err) {
      console.warn('[TEFFEIN Addresses] Could not load addresses from Supabase, using local cache:', err);
      return getSavedAddresses();
    }
  },

  /**
   * Creates a new delivery address in Supabase
   */
  async createAddress(userId: string | undefined, address: Omit<DeliveryAddress, 'id' | 'createdAt' | 'updatedAt'>): Promise<DeliveryAddress> {
    const tempId = `addr-${Date.now()}`;
    const newAddress: DeliveryAddress = {
      ...address,
      id: tempId,
      userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (!isSupabaseConfigured() || !userId) {
      const current = getSavedAddresses();
      if (newAddress.isDefault) {
        current.forEach(a => a.isDefault = false);
      }
      const updated = [newAddress, ...current];
      saveAddressesToStorage(updated);
      return newAddress;
    }

    try {
      const client = getSupabaseClient();
      const payload: any = {
        user_id: userId,
        label: address.label as any,
        custom_label: address.customLabel || null,
        recipient_name: address.fullName || address.name,
        recipient_phone: address.phone,
        house_flat_number: address.houseNumber || null,
        building_name: address.building || null,
        landmark: address.landmark || null,
        area: address.area,
        sector: address.sector || address.area,
        city: address.city || 'Gandhinagar',
        state: address.state || 'Gujarat',
        pincode: address.pincode,
        latitude: address.latitude || null,
        longitude: address.longitude || null,
        gps_accuracy: address.accuracy || null,
        place_id: address.placeId || null,
        source: (address.source as any) || 'map',
        delivery_instructions: address.instructions || null,
        instruction_preset: (address.instructionPreset as any) || 'call_on_reach',
        is_default: address.isDefault ?? false,
        cluster_id: address.clusterId || 'cluster-a',
        zone_id: address.zoneId || 'zone_a_core',
        is_serviceable: address.isServiceable ?? true
      };

      const { data, error } = await client
        .from('addresses')
        .insert(payload)
        .select()
        .single();

      if (error) throw error;

      const createdRow = data as any;
      const created: DeliveryAddress = {
        ...newAddress,
        id: createdRow?.id || tempId,
        createdAt: createdRow?.created_at || newAddress.createdAt,
        updatedAt: createdRow?.updated_at || newAddress.updatedAt
      };

      const current = getSavedAddresses();
      if (created.isDefault) {
        current.forEach(a => a.isDefault = false);
      }
      saveAddressesToStorage([created, ...current.filter(a => a.id !== created.id)]);

      return created;
    } catch (err) {
      console.error('[TEFFEIN Addresses] Failed to insert address into Supabase:', err);
      // Fallback local save
      const current = getSavedAddresses();
      const updated = [newAddress, ...current];
      saveAddressesToStorage(updated);
      return newAddress;
    }
  },

  /**
   * Updates an existing address
   */
  async updateAddress(addressId: string, updates: Partial<DeliveryAddress>, userId?: string): Promise<boolean> {
    const current = getSavedAddresses();
    const index = current.findIndex(a => a.id === addressId);
    if (index !== -1) {
      if (updates.isDefault) {
        current.forEach(a => a.isDefault = false);
      }
      current[index] = { ...current[index], ...updates, updatedAt: new Date().toISOString() };
      saveAddressesToStorage(current);
    }

    if (!isSupabaseConfigured() || !userId) {
      return true;
    }

    try {
      const client = getSupabaseClient();
      const payload: any = {};
      if (updates.label) payload.label = updates.label;
      if (updates.customLabel !== undefined) payload.custom_label = updates.customLabel;
      if (updates.fullName || updates.name) payload.recipient_name = updates.fullName || updates.name;
      if (updates.phone) payload.recipient_phone = updates.phone;
      if (updates.houseNumber !== undefined) payload.house_flat_number = updates.houseNumber;
      if (updates.building !== undefined) payload.building_name = updates.building;
      if (updates.landmark !== undefined) payload.landmark = updates.landmark;
      if (updates.area) payload.area = updates.area;
      if (updates.sector !== undefined) payload.sector = updates.sector;
      if (updates.city) payload.city = updates.city;
      if (updates.pincode) payload.pincode = updates.pincode;
      if (updates.latitude !== undefined) payload.latitude = updates.latitude;
      if (updates.longitude !== undefined) payload.longitude = updates.longitude;
      if (updates.instructions !== undefined) payload.delivery_instructions = updates.instructions;
      if (updates.instructionPreset !== undefined) payload.instruction_preset = updates.instructionPreset;
      if (updates.isDefault !== undefined) payload.is_default = updates.isDefault;

      const { error } = await client
        .from('addresses')
        .update(payload)
        .eq('id', addressId);

      if (error) throw error;
      return true;
    } catch (err) {
      console.error('[TEFFEIN Addresses] Failed to update address in Supabase:', err);
      return false;
    }
  },

  /**
   * Deletes an address
   */
  async deleteAddress(addressId: string, userId?: string): Promise<boolean> {
    const current = getSavedAddresses().filter(a => a.id !== addressId);
    saveAddressesToStorage(current);

    if (!isSupabaseConfigured() || !userId) {
      return true;
    }

    try {
      const client = getSupabaseClient();
      const { error } = await client
        .from('addresses')
        .delete()
        .eq('id', addressId);

      if (error) throw error;
      return true;
    } catch (err) {
      console.error('[TEFFEIN Addresses] Failed to delete address from Supabase:', err);
      return false;
    }
  },

  /**
   * Fetches active delivery zones from Supabase
   */
  async getDeliveryZones(): Promise<Record<string, DeliveryZone>> {
    if (!isSupabaseConfigured()) {
      return DELIVERY_ZONES;
    }

    try {
      const client = getSupabaseClient();
      const { data, error } = await client
        .from('delivery_zones')
        .select('*')
        .eq('is_active', true);

      if (error || !data || (data as any[]).length === 0) {
        return DELIVERY_ZONES;
      }

      const result: Record<string, DeliveryZone> = {};
      (data as any[]).forEach((item: any) => {
        result[item.id] = {
          id: item.id as any,
          name: item.name,
          tagline: item.tagline || '',
          description: item.description || '',
          deliveryFee: Number(item.delivery_fee),
          estimatedDurationMinutes: item.estimated_duration_minutes,
          minOrderAmount: Number(item.min_order_amount),
          isFreeDelivery: item.is_free_delivery,
          pincodes: item.pincodes || [],
          sectors: item.sectors || []
        };
      });

      return result;
    } catch (err) {
      console.warn('[TEFFEIN Delivery Zones] Failed to fetch zones from Supabase, using defaults:', err);
      return DELIVERY_ZONES;
    }
  },

  /**
   * Submits an area waitlist entry
   */
  async submitAreaWaitlist(entry: Omit<AreaWaitlistEntry, 'id' | 'createdAt'>): Promise<{ success: boolean; error: Error | null }> {
    if (!isSupabaseConfigured()) {
      return { success: true, error: null };
    }

    try {
      const client = getSupabaseClient();
      const { error } = await client
        .from('area_waitlist')
        .insert({
          name: entry.name,
          contact: entry.contact,
          area: entry.area,
          city: entry.city || 'Gandhinagar',
          pincode: entry.pincode || null,
          segment: entry.segment || 'individual'
        } as any);

      if (error) throw error;
      return { success: true, error: null };
    } catch (err: any) {
      console.error('[TEFFEIN Waitlist] Failed to submit waitlist:', err);
      return { success: false, error: err };
    }
  }
};
