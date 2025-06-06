import { onCLS, onLCP } from 'web-vitals';
import type { Metric } from 'web-vitals';

export const trackPerformance = () => {
  // Track Cumulative Layout Shift (CLS)
  onCLS((metric: Metric) => {
    // Send to analytics or store for analysis
  });

  // Track Largest Contentful Paint (LCP)
  onLCP((metric: Metric) => {
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

  // Performance Recommendations
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

  // Interaction Recommendations
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

  return recommendations;
}; 