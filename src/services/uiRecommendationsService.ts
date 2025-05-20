import { supabase } from '../lib/supabase';

export interface UIRecommendation {
  id: string;
  title: string;
  description: string;
  status: 'implemented' | 'pending' | 'in-progress';
  category: 'visual' | 'interaction' | 'performance' | 'animation';
  created_at: string;
  updated_at: string;
}

export const uiRecommendationsService = {
  async getRecommendations(): Promise<UIRecommendation[]> {
    const { data, error } = await supabase
      .from('ui_recommendations')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching UI recommendations:', error);
      throw error;
    }

    return data || [];
  },

  async updateRecommendationStatus(id: string, status: UIRecommendation['status']): Promise<void> {
    const { error } = await supabase
      .from('ui_recommendations')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      console.error('Error updating UI recommendation status:', error);
      throw error;
    }
  },

  async addRecommendation(recommendation: Omit<UIRecommendation, 'id' | 'created_at' | 'updated_at'>): Promise<void> {
    const { error } = await supabase
      .from('ui_recommendations')
      .insert([{
        ...recommendation,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }]);

    if (error) {
      console.error('Error adding UI recommendation:', error);
      throw error;
    }
  }
}; 