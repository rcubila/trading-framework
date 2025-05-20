import { supabase } from '../lib/supabase';

async function updateAnimationRecommendations() {
  try {
    // Get all animation recommendations
    const { data: recommendations, error: fetchError } = await supabase
      .from('ui_recommendations')
      .select('*')
      .eq('category', 'animation');

    if (fetchError) {
      throw fetchError;
    }

    // Update each recommendation to 'implemented'
    for (const recommendation of recommendations) {
      const { error: updateError } = await supabase
        .from('ui_recommendations')
        .update({ 
          status: 'implemented',
          updated_at: new Date().toISOString()
        })
        .eq('id', recommendation.id);

      if (updateError) {
        console.error(`Error updating recommendation ${recommendation.id}:`, updateError);
      } else {
        console.log(`Successfully updated recommendation: ${recommendation.title}`);
      }
    }

    console.log('All animation recommendations have been updated to implemented status.');
  } catch (error) {
    console.error('Error updating recommendations:', error);
  }
}

// Run the update
updateAnimationRecommendations(); 