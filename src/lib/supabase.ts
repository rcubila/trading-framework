import { createClient } from '@supabase/supabase-js';
import type { Database } from './supabase-types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

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
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async deleteTrade(id: string) {
    const { error } = await supabase
      .from('trades')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  async getTrades(userId: string) {
    const { data, error } = await supabase
      .from('trades')
      .select('*')
      .eq('user_id', userId)
      .order('entry_date', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async getTradeById(id: string) {
    const { data, error } = await supabase
      .from('trades')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  }
};

// Helper functions for profiles
export const profilesApi = {
  async getProfile(userId: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateProfile(userId: string, profile: Database['public']['Tables']['profiles']['Update']) {
    const { data, error } = await supabase
      .from('profiles')
      .update(profile)
      .eq('id', userId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
};

// Add more API helpers as needed... 