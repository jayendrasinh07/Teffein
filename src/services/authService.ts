import { User, Session, AuthChangeEvent } from '@supabase/supabase-js';
import { getSupabaseClient, isSupabaseConfigured } from './supabaseClient';
import { CustomerSegmentType, UserRoleType } from '../types/database.types';

export interface AuthProfile {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  segment: CustomerSegmentType;
  dietPreference?: string;
  defaultPortion?: string;
  avatarUrl?: string;
}

export interface AuthState {
  user: User | null;
  profile: AuthProfile | null;
  roles: UserRoleType[];
  isAuthenticated: boolean;
  isLoading: boolean;
}

// Authentication always uses Supabase.


export const authService = {
  /**
   * Registers a new user with Supabase Auth and metadata for automatic profile creation
   */
  async signUp(
    email: string,
    password: string,
    fullName: string,
    phone: string,
    segment: CustomerSegmentType = 'individual'
  ): Promise<{ user: User | null; error: Error | null }> {
    if (!isSupabaseConfigured()) { return {user:null,error:new Error('Sign-in is currently unavailable.')} ; }

    try {
      const client = getSupabaseClient();
      const { data, error } = await client.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            phone,
            segment
          }
        }
      });

      if (error) throw error;
      return { user: data.user, error: null };
    } catch (err: any) {
      console.error('[TEFFEIN Auth] Sign up error:', err);
      return { user: null, error: err };
    }
  },

  /**
   * Signs in user with Email and Password
   */
  async signIn(email: string, password: string): Promise<{ user: User | null; session: Session | null; error: Error | null }> {
    if (!isSupabaseConfigured()) { return {user:null,session:null,error:new Error('Sign-in is currently unavailable.')} ; }

    try {
      const client = getSupabaseClient();
      const { data, error } = await client.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;
      return { user: data.user, session: data.session, error: null };
    } catch (err: any) {
      console.error('[TEFFEIN Auth] Sign in error:', err);
      return { user: null, session: null, error: err };
    }
  },

  /**
   * Signs out current user
   */
  async signOut(): Promise<{ error: Error | null }> {
    if (!isSupabaseConfigured()) { return {error:null}; }

    try {
      const client = getSupabaseClient();
      const { error } = await client.auth.signOut();
      if (error) throw error;
      return { error: null };
    } catch (err: any) {
      console.error('[TEFFEIN Auth] Sign out error:', err);
      return { error: err };
    }
  },

  /**
   * Gets current active auth user
   */
  async getCurrentUser(): Promise<User | null> {
    if (!isSupabaseConfigured()) { return null; }

    try {
      const client = getSupabaseClient();
      const { data: { user }, error } = await client.auth.getUser();
      if (error || !user) return null;
      return user;
    } catch (err) {
      console.warn('[TEFFEIN Auth] Failed to fetch current user:', err);
      return null;
    }
  },

  /**
   * Fetches public profile for a user
   */
  async getProfile(userId: string): Promise<AuthProfile | null> {
    if (!isSupabaseConfigured()) { return null; }

    try {
      const client = getSupabaseClient();
      const { data, error } = await client
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error || !data) return null;

      const row = data as any;
      return {
        id: row.id,
        fullName: row.full_name,
        phone: row.phone || '',
        email: row.email || '',
        segment: (row.segment as CustomerSegmentType) || 'individual',
        dietPreference: row.diet_preference || undefined,
        defaultPortion: row.default_portion || undefined,
        avatarUrl: row.avatar_url || undefined
      };
    } catch (err) {
      console.warn('[TEFFEIN Auth] Failed to fetch profile from Supabase:', err);
      return null;
    }
  },

  /**
   * Fetches roles assigned to user
   */
  async getUserRoles(userId: string): Promise<UserRoleType[]> {
    if (!isSupabaseConfigured()) { return []; }

    try {
      const client = getSupabaseClient();
      const { data, error } = await client
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);

      if (error || !data || data.length === 0) {
        return [];
      }

      return (data as any[]).map((r) => r.role as UserRoleType);
    } catch (err) {
      console.warn('[TEFFEIN Auth] Failed to fetch roles:', err);
      return [];
    }
  },

  /**
   * Updates profile fields in Supabase
   */
  async updateProfile(userId: string, updates: Partial<AuthProfile>): Promise<{ success: boolean; error: Error | null }> {
    if (!isSupabaseConfigured()) { return {success:false,error:new Error('Profile updates are currently unavailable.')}; }

    try {
      const client = getSupabaseClient();
      const payload: any = {};
      if (updates.fullName !== undefined) payload.full_name = updates.fullName;
      if (updates.phone !== undefined) payload.phone = updates.phone;
      if (updates.segment !== undefined) payload.segment = updates.segment;
      if (updates.dietPreference !== undefined) payload.diet_preference = updates.dietPreference;
      if (updates.defaultPortion !== undefined) payload.default_portion = updates.defaultPortion;

      const { error } = await client
        .from('profiles')
        .update(payload)
        .eq('id', userId);

      if (error) throw error;
      return { success: true, error: null };
    } catch (err: any) {
      console.error('[TEFFEIN Auth] Profile update failed:', err);
      return { success: false, error: err };
    }
  },

  /**
   * Subscribes to auth state changes
   */
  onAuthStateChange(callback: (event: AuthChangeEvent, session: Session | null) => void) {
    if (!isSupabaseConfigured()) {
      return { data: { subscription: { unsubscribe: () => {} } } };
    }
    const client = getSupabaseClient();
    return client.auth.onAuthStateChange(callback);
  }
};
