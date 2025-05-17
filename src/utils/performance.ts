import { onCLS, onLCP } from 'web-vitals';
import type { Metric } from 'web-vitals';

export const trackPerformance = () => {
  // Track Cumulative Layout Shift (CLS)
  onCLS((metric: Metric) => {
    console.log('Cumulative Layout Shift:', metric.value);
    // Send to analytics or store for analysis
  });

  // Track Largest Contentful Paint (LCP)
  onLCP((metric: Metric) => {
    console.log('Largest Contentful Paint:', metric.value);
    // Send to analytics or store for analysis
  });
};

// UI Improvement Recommendations
export const getUIRecommendations = (metrics: {
  CLS: number;
  LCP: number;
  FID: number;
}) => {
  const recommendations = [];

  // Layout Shift Recommendations
  if (metrics.CLS > 0.1) {
    recommendations.push({
      type: 'layout',
      priority: 'high',
      message: 'High layout shifts detected. Consider fixing dynamic content loading and image dimensions.',
      suggestions: [
        'Set explicit width and height for images',
        'Avoid inserting content above existing content',
        'Use CSS transforms instead of top/left properties'
      ]
    });
  }

  // Performance Recommendations
  if (metrics.LCP > 2.5) {
    recommendations.push({
      type: 'performance',
      priority: 'high',
      message: 'Slow content loading detected. Consider optimizing resource loading.',
      suggestions: [
        'Implement lazy loading for images',
        'Optimize critical rendering path',
        'Consider using a CDN for static assets'
      ]
    });
  }

  // Interaction Recommendations
  if (metrics.FID > 100) {
    recommendations.push({
      type: 'interaction',
      priority: 'medium',
      message: 'Slow interaction response detected. Consider optimizing event handlers.',
      suggestions: [
        'Debounce or throttle event handlers',
        'Move heavy computations off the main thread',
        'Consider using Web Workers for heavy tasks'
      ]
    });
  }

  return recommendations;
}; 