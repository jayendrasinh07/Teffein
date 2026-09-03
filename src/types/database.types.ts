export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRoleType = 'customer' | 'admin' | 'kitchen' | 'delivery' | 'corporate';
export type CustomerSegmentType = 'student' | 'worker' | 'corporate' | 'family' | 'individual';
export type AddressLabelType = 'Home' | 'Office' | 'College' | 'PG' | 'Other';
export type InstructionPresetType = 'call_on_reach' | 'leave_at_security' | 'ring_bell' | 'deliver_at_reception' | 'custom';
export type LocationSourceType = 'gps' | 'search' | 'map' | 'saved' | 'manual';
export type MealType = 'lunch' | 'dinner' | 'both' | 'breakfast' | 'snack';
export type OrderStatusType = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'out_for_delivery' | 'delivered' | 'cancelled';
export type PaymentStatusType = 'pending' | 'processing' | 'paid' | 'failed' | 'refunded';

export interface Database {
  public: {
    Tables: {
      // ------------------------------------------------------------------------
      // PHASE 1 TABLES
      // ------------------------------------------------------------------------
      profiles: {
        Row: {
          id: string;
          full_name: string;
          phone: string | null;
          email: string | null;
          avatar_url: string | null;
          segment: CustomerSegmentType;
          diet_preference: string | null;
          default_portion: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name: string;
          phone?: string | null;
          email?: string | null;
          avatar_url?: string | null;
          segment?: CustomerSegmentType;
          diet_preference?: string | null;
          default_portion?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string;
          phone?: string | null;
          email?: string | null;
          avatar_url?: string | null;
          segment?: CustomerSegmentType;
          diet_preference?: string | null;
          default_portion?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      user_roles: {
        Row: {
          id: string;
          user_id: string;
          role: UserRoleType;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          role?: UserRoleType;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          role?: UserRoleType;
          created_at?: string;
        };
      };
      delivery_zones: {
        Row: {
          id: string;
          name: string;
          tagline: string | null;
          description: string | null;
          delivery_fee: number;
          estimated_duration_minutes: number;
          min_order_amount: number;
          is_free_delivery: boolean;
          pincodes: string[];
          sectors: string[];
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          name: string;
          tagline?: string | null;
          description?: string | null;
          delivery_fee?: number;
          estimated_duration_minutes?: number;
          min_order_amount?: number;
          is_free_delivery?: boolean;
          pincodes?: string[];
          sectors?: string[];
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          tagline?: string | null;
          description?: string | null;
          delivery_fee?: number;
          estimated_duration_minutes?: number;
          min_order_amount?: number;
          is_free_delivery?: boolean;
          pincodes?: string[];
          sectors?: string[];
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      addresses: {
        Row: {
          id: string;
          user_id: string;
          label: AddressLabelType;
          custom_label: string | null;
          recipient_name: string;
          recipient_phone: string;
          house_flat_number: string | null;
          building_name: string | null;
          floor: string | null;
          street: string | null;
          landmark: string | null;
          area: string;
          sector: string | null;
          city: string;
          state: string;
          pincode: string;
          latitude: number | null;
          longitude: number | null;
          gps_accuracy: number | null;
          place_id: string | null;
          formatted_address: string | null;
          source: LocationSourceType;
          delivery_instructions: string | null;
          instruction_preset: InstructionPresetType | null;
          is_default: boolean;
          is_verified: boolean;
          cluster_id: string | null;
          zone_id: string | null;
          is_serviceable: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          label?: AddressLabelType;
          custom_label?: string | null;
          recipient_name: string;
          recipient_phone: string;
          house_flat_number?: string | null;
          building_name?: string | null;
          floor?: string | null;
          street?: string | null;
          landmark?: string | null;
          area: string;
          sector?: string | null;
          city?: string;
          state?: string;
          pincode: string;
          latitude?: number | null;
          longitude?: number | null;
          gps_accuracy?: number | null;
          place_id?: string | null;
          formatted_address?: string | null;
          source?: LocationSourceType;
          delivery_instructions?: string | null;
          instruction_preset?: InstructionPresetType | null;
          is_default?: boolean;
          is_verified?: boolean;
          cluster_id?: string | null;
          zone_id?: string | null;
          is_serviceable?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          label?: AddressLabelType;
          custom_label?: string | null;
          recipient_name?: string;
          recipient_phone?: string;
          house_flat_number?: string | null;
          building_name?: string | null;
          floor?: string | null;
          street?: string | null;
          landmark?: string | null;
          area?: string;
          sector?: string | null;
          city?: string;
          state?: string;
          pincode?: string;
          latitude?: number | null;
          longitude?: number | null;
          gps_accuracy?: number | null;
          place_id?: string | null;
          formatted_address?: string | null;
          source?: LocationSourceType;
          delivery_instructions?: string | null;
          instruction_preset?: InstructionPresetType | null;
          is_default?: boolean;
          is_verified?: boolean;
          cluster_id?: string | null;
          zone_id?: string | null;
          is_serviceable?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      area_waitlist: {
        Row: {
          id: string;
          name: string;
          contact: string;
          area: string;
          city: string;
          pincode: string | null;
          segment: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          contact: string;
          area: string;
          city?: string;
          pincode?: string | null;
          segment?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          contact?: string;
          area?: string;
          city?: string;
          pincode?: string | null;
          segment?: string | null;
          created_at?: string;
        };
      };

      // ------------------------------------------------------------------------
      // PHASE 2 TABLES (ORDERING ENGINE)
      // ------------------------------------------------------------------------
      meals: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          image_url: string | null;
          meal_type: MealType;
          diet_type: string | null;
          base_price: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          image_url?: string | null;
          meal_type?: MealType;
          diet_type?: string | null;
          base_price?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          image_url?: string | null;
          meal_type?: MealType;
          diet_type?: string | null;
          base_price?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      menu_days: {
        Row: {
          id: string;
          menu_date: string;
          is_published: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          menu_date: string;
          is_published?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          menu_date?: string;
          is_published?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      menu_items: {
        Row: {
          id: string;
          menu_day_id: string;
          meal_id: string;
          availability: boolean;
          display_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          menu_day_id: string;
          meal_id: string;
          availability?: boolean;
          display_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          menu_day_id?: string;
          meal_id?: string;
          availability?: boolean;
          display_order?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      meal_customizations: {
        Row: {
          id: string;
          meal_id: string | null;
          name: string;
          description: string | null;
          price: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          meal_id?: string | null;
          name: string;
          description?: string | null;
          price?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          meal_id?: string | null;
          name?: string;
          description?: string | null;
          price?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      delivery_slots: {
        Row: {
          id: string;
          name: string;
          meal_type: 'lunch' | 'dinner';
          start_time: string;
          end_time: string;
          max_orders: number;
          cutoff_time: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          meal_type: 'lunch' | 'dinner';
          start_time: string;
          end_time: string;
          max_orders?: number;
          cutoff_time?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          meal_type?: 'lunch' | 'dinner';
          start_time?: string;
          end_time?: string;
          max_orders?: number;
          cutoff_time?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      orders: {
        Row: {
          id: string;
          user_id: string;
          address_id: string | null;
          order_number: string;
          order_date: string;
          meal_type: 'lunch' | 'dinner';
          delivery_slot_id: string | null;
          status: OrderStatusType;
          subtotal: number;
          customization_total: number;
          delivery_fee: number;
          discount: number;
          grand_total: number;
          payment_status: PaymentStatusType;
          notes: string | null;
          address_snapshot: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          address_id?: string | null;
          order_number: string;
          order_date: string;
          meal_type: 'lunch' | 'dinner';
          delivery_slot_id?: string | null;
          status?: OrderStatusType;
          subtotal?: number;
          customization_total?: number;
          delivery_fee?: number;
          discount?: number;
          grand_total?: number;
          payment_status?: PaymentStatusType;
          notes?: string | null;
          address_snapshot: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          address_id?: string | null;
          order_number?: string;
          order_date?: string;
          meal_type?: 'lunch' | 'dinner';
          delivery_slot_id?: string | null;
          status?: OrderStatusType;
          subtotal?: number;
          customization_total?: number;
          delivery_fee?: number;
          discount?: number;
          grand_total?: number;
          payment_status?: PaymentStatusType;
          notes?: string | null;
          address_snapshot?: Json;
          created_at?: string;
          updated_at?: string;
        };
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          meal_id: string | null;
          meal_name_snapshot: string;
          quantity: number;
          unit_price: number;
          line_total: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          meal_id?: string | null;
          meal_name_snapshot: string;
          quantity?: number;
          unit_price?: number;
          line_total?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          order_id?: string;
          meal_id?: string | null;
          meal_name_snapshot?: string;
          quantity?: number;
          unit_price?: number;
          line_total?: number;
          created_at?: string;
        };
      };
      order_customizations: {
        Row: {
          id: string;
          order_item_id: string;
          customization_id: string | null;
          customization_name_snapshot: string;
          quantity: number;
          unit_price: number;
          line_total: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_item_id: string;
          customization_id?: string | null;
          customization_name_snapshot: string;
          quantity?: number;
          unit_price?: number;
          line_total?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          order_item_id?: string;
          customization_id?: string | null;
          customization_name_snapshot?: string;
          quantity?: number;
          unit_price?: number;
          line_total?: number;
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      is_admin: {
        Args: { user_id: string };
        Returns: boolean;
      };
      place_order_secure: {
        Args: {
          p_order_date: string;
          p_meal_type: 'lunch' | 'dinner';
          p_delivery_slot_id: string;
          p_address_id: string;
          p_meal_id: string;
          p_quantity: number;
          p_customizations?: Json;
          p_notes?: string | null;
        };
        Returns: Json;
      };
    };
    Enums: {
      user_role_type: UserRoleType;
      customer_segment_type: CustomerSegmentType;
      address_label_type: AddressLabelType;
      instruction_preset_type: InstructionPresetType;
      location_source_type: LocationSourceType;
      meal_type: MealType;
      order_status_type: OrderStatusType;
      payment_status_type: PaymentStatusType;
    };
  };
}

