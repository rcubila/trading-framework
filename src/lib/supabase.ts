import { createClient } from '@supabase/supabase-js';
import type { Database } from './supabase-types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Regular client with RLS
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Service role client that bypasses RLS
export const supabaseAdmin = createClient<Database>(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Helper functions for trades
export const tradesApi = {
  async createTrade(trade: Database['public']['Tables']['trades']['Insert']) {
    const { data, error } = await supabase
      .from('trades')
      .insert(trade)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateTrade(id: string, trade: Database['public']['Tables']['trades']['Update']) {
    const { data, error } = await supabase
      .from('trades')
      .update(trade)
      .eq('id', id)
      .is('deleted_at', null)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async deleteTrade(id: string) {
    const { error } = await supabase
      .from('trades')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
      .is('deleted_at', null);
    
    if (error) throw error;
  },

  async getTrades(userId: string) {
    const { data, error } = await supabase
      .from('trades')
      .select('*')
      .eq('user_id', userId)
      .is('deleted_at', null)
      .order('entry_date', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async getTradeById(id: string) {
    const { data, error } = await supabase
      .from('trades')
      .select('*')
      .eq('id', id)
      .is('deleted_at', null)
      .single();
    
    if (error) throw error;
    return data;
  },

  // New function to get deleted trades
  async getDeletedTrades(userId: string) {
    const { data, error } = await supabase
      .from('trades')
      .select('*')
      .eq('user_id', userId)
      .not('deleted_at', 'is', null)
      .order('deleted_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // New function to restore a deleted trade
  async restoreTrade(id: string) {
    const { data, error } = await supabase
      .from('trades')
      .update({ deleted_at: null })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // New function to permanently delete a trade
  async permanentDeleteTrade(id: string) {
    const { error } = await supabase
      .from('trades')
      .delete()
      .eq('id', id)
      .not('deleted_at', 'is', null);
    
    if (error) throw error;
  }
};

// Helper functions for profiles
export const profilesApi = {
  async getProfile(userId: string) {
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateProfile(userId: string, profile: Database['public']['Tables']['profiles']['Update']) {
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .update(profile)
      .eq('id', userId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async createProfile(profile: Database['public']['Tables']['profiles']['Insert']) {
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .insert(profile)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
};

// Add more API helpers as needed... 