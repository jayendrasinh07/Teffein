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

// Local mock storage for preview / offline demo mode
const LOCAL_AUTH_KEY = 'teffein_mock_auth_session';

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
    if (!isSupabaseConfigured()) {
      // Local Mock Signup
      const mockId = 'usr-' + Date.now();
      const mockUser: any = {
        id: mockId,
        email,
        phone,
        user_metadata: { full_name: fullName, phone, segment },
        created_at: new Date().toISOString()
      };
      const mockProfile: AuthProfile = {
        id: mockId,
        fullName,
        phone,
        email,
        segment
      };
      localStorage.setItem(LOCAL_AUTH_KEY, JSON.stringify({ user: mockUser, profile: mockProfile, roles: ['customer'] }));
      return { user: mockUser, error: null };
    }

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
    if (!isSupabaseConfigured()) {
      // Local Mock SignIn
      const existing = localStorage.getItem(LOCAL_AUTH_KEY);
      if (existing) {
        const parsed = JSON.parse(existing);
        return { user: parsed.user, session: null, error: null };
      }
      // Demo default user
      const mockUser: any = {
        id: 'usr-demo-gandhinagar',
        email,
        user_metadata: { full_name: 'Jayendrasinh Parmar', phone: '9825014820', segment: 'worker' },
        created_at: new Date().toISOString()
      };
      const mockProfile: AuthProfile = {
        id: 'usr-demo-gandhinagar',
        fullName: 'Jayendrasinh Parmar',
        phone: '9825014820',
        email,
        segment: 'worker'
      };
      localStorage.setItem(LOCAL_AUTH_KEY, JSON.stringify({ user: mockUser, profile: mockProfile, roles: ['customer'] }));
      return { user: mockUser, session: null, error: null };
    }

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
    if (!isSupabaseConfigured()) {
      localStorage.removeItem(LOCAL_AUTH_KEY);
      return { error: null };
    }

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
    if (!isSupabaseConfigured()) {
      const existing = localStorage.getItem(LOCAL_AUTH_KEY);
      if (!existing) return null;
      try {
        const parsed = JSON.parse(existing);
        return parsed.user;
      } catch {
        return null;
      }
    }

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
    if (!isSupabaseConfigured()) {
      const existing = localStorage.getItem(LOCAL_AUTH_KEY);
      if (!existing) return null;
      try {
        const parsed = JSON.parse(existing);
        return parsed.profile;
      } catch {
        return null;
      }
    }

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
    if (!isSupabaseConfigured()) {
      const existing = localStorage.getItem(LOCAL_AUTH_KEY);
      if (!existing) return ['customer'];
      try {
        const parsed = JSON.parse(existing);
        return parsed.roles || ['customer'];
      } catch {
        return ['customer'];
      }
    }

    try {
      const client = getSupabaseClient();
      const { data, error } = await client
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);

      if (error || !data || data.length === 0) {
        return ['customer'];
      }

      return (data as any[]).map((r) => r.role as UserRoleType);
    } catch (err) {
      console.warn('[TEFFEIN Auth] Failed to fetch roles:', err);
      return ['customer'];
    }
  },

  /**
   * Updates profile fields in Supabase
   */
  async updateProfile(userId: string, updates: Partial<AuthProfile>): Promise<{ success: boolean; error: Error | null }> {
    if (!isSupabaseConfigured()) {
      const existing = localStorage.getItem(LOCAL_AUTH_KEY);
      if (existing) {
        const parsed = JSON.parse(existing);
        parsed.profile = { ...parsed.profile, ...updates };
        localStorage.setItem(LOCAL_AUTH_KEY, JSON.stringify(parsed));
      }
      return { success: true, error: null };
    }

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
