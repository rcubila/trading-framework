import React from 'react';
import { PageHeader } from '../components/PageHeader';

export const UIRecommendationsPage = () => {
  return (
    <div style={{ 
      padding: '5px',
      color: 'white',
      background: 'linear-gradient(160deg, rgba(15, 23, 42, 0.3) 0%, rgba(30, 27, 75, 0.3) 100%)',
      minHeight: '100vh',
      backdropFilter: 'blur(10px)'
    }}>
      <PageHeader 
        title="UI Recommendations"
        subtitle="Suggestions to improve your user experience"
      />

      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-800/60 border border-gray-700 p-6 rounded-xl">
            <h2 className="text-xl font-semibold text-white mb-4">Visual Improvements</h2>
            <ul className="space-y-4">
              <RecommendationItem 
                title="Consistent Spacing"
                description="Use consistent margin and padding throughout the application."
                status="implemented"
              />
              <RecommendationItem 
                title="Color Contrast"
                description="Improve contrast ratios for better accessibility."
                status="pending"
              />
              <RecommendationItem 
                title="Loading States"
                description="Add skeleton loaders for all data fetching operations."
                status="in-progress"
              />
            </ul>
          </div>

          <div className="bg-gray-800/60 border border-gray-700 p-6 rounded-xl">
            <h2 className="text-xl font-semibold text-white mb-4">Interaction Improvements</h2>
            <ul className="space-y-4">
              <RecommendationItem 
                title="Error Messages"
                description="Provide clear error messages for all form submissions."
                status="implemented"
              />
              <RecommendationItem 
                title="Keyboard Navigation"
                description="Ensure all interactive elements are keyboard accessible."
                status="pending"
              />
              <RecommendationItem 
                title="Responsive Behavior"
                description="Optimize layouts for mobile and tablet devices."
                status="in-progress"
              />
            </ul>
          </div>

          <div className="bg-gray-800/60 border border-gray-700 p-6 rounded-xl">
            <h2 className="text-xl font-semibold text-white mb-4">Performance Optimizations</h2>
            <ul className="space-y-4">
              <RecommendationItem 
                title="Image Optimization"
                description="Optimize all images for faster loading times."
                status="implemented"
              />
              <RecommendationItem 
                title="Code Splitting"
                description="Implement code splitting for faster initial load."
                status="pending"
              />
              <RecommendationItem 
                title="Caching Strategy"
                description="Implement proper caching for API responses."
                status="in-progress"
              />
            </ul>
          </div>

          <div className="bg-gray-800/60 border border-gray-700 p-6 rounded-xl">
            <h2 className="text-xl font-semibold text-white mb-4">Animation Recommendations</h2>
            <ul className="space-y-4">
              <RecommendationItem 
                title="Page Transitions"
                description="Implement smooth page transitions using AnimatedRoutes component with fade and slide effects."
                status="implemented"
              />
              <RecommendationItem 
                title="Interactive Elements"
                description="Add hover and click animations to buttons and cards using AnimatedButton and AnimatedCard components."
                status="pending"
              />
              <RecommendationItem 
                title="Data Loading States"
                description="Implement skeleton loading animations for data fetching operations using LoadingSpinner component."
                status="in-progress"
              />
              <RecommendationItem 
                title="Micro-interactions"
                description="Add subtle feedback animations for user actions like form submissions and notifications."
                status="pending"
              />
              <RecommendationItem 
                title="Chart Animations"
                description="Enhance TradeChart with smooth data transitions and interactive hover effects."
                status="pending"
              />
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

interface RecommendationItemProps {
  title: string;
  description: string;
  status: 'implemented' | 'pending' | 'in-progress';
}

const RecommendationItem = ({ title, description, status }: RecommendationItemProps) => {
  const getStatusBadge = () => {
    switch (status) {
      case 'implemented':
        return <span className="px-2 py-1 text-xs rounded-full bg-green-900/30 text-green-400 border border-green-700">Implemented</span>;
      case 'pending':
        return <span className="px-2 py-1 text-xs rounded-full bg-yellow-900/30 text-yellow-400 border border-yellow-700">Pending</span>;
      case 'in-progress':
        return <span className="px-2 py-1 text-xs rounded-full bg-blue-900/30 text-blue-400 border border-blue-700">In Progress</span>;
      default:
        return null;
    }
  };

  return (
    <li className="flex items-start space-x-4">
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-white">{title}</h3>
          {getStatusBadge()}
        </div>
        <p className="text-gray-400 text-sm mt-1">{description}</p>
      </div>
    </li>
  );
};

export default UIRecommendationsPage; 