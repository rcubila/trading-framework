import { uiRecommendationsService } from '../services/uiRecommendationsService';

async function updateAnimationRecommendations() {
  try {
    // Get all recommendations
    const recommendations = await uiRecommendationsService.getRecommendations();
    
    // Filter animation recommendations
    const animationRecommendations = recommendations.filter(rec => rec.category === 'animation');
    
    // Update each animation recommendation to implemented
    for (const rec of animationRecommendations) {
      await uiRecommendationsService.updateRecommendationStatus(rec.id, 'implemented');
      console.log(`Updated ${rec.title} to implemented`);
    }
    
    console.log('All animation recommendations have been updated to implemented status');
  } catch (error) {
    console.error('Error updating animation recommendations:', error);
  }
}

// Run the update
updateAnimationRecommendations(); 