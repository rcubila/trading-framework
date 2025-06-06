import React from 'react';
import { PageHeader } from '../components/PageHeader/PageHeader';
import styles from './UIRecommendationsPage.module.css';

export const UIRecommendationsPage = () => {
  return (
    <div className={styles.container}>
      <PageHeader 
        title="UI Recommendations"
        subtitle="Suggestions to improve your user experience"
      />

      <div className={styles.content}>
        <div className={styles.grid}>
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Visual Improvements</h2>
            <ul className={styles.list}>
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

          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Interaction Improvements</h2>
            <ul className={styles.list}>
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

          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Performance Optimizations</h2>
            <ul className={styles.list}>
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

          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Animation Recommendations</h2>
            <ul className={styles.list}>
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
        return <span className={styles.statusImplemented}>Implemented</span>;
      case 'pending':
        return <span className={styles.statusPending}>Pending</span>;
      case 'in-progress':
        return <span className={styles.statusInProgress}>In Progress</span>;
      default:
        return null;
    }
  };

  return (
    <li className={styles.recommendationItem}>
      <div className={styles.recommendationContent}>
        <div className={styles.recommendationHeader}>
          <h3 className={styles.recommendationTitle}>{title}</h3>
          {getStatusBadge()}
        </div>
        <p className={styles.recommendationDescription}>{description}</p>
      </div>
    </li>
  );
};

export default UIRecommendationsPage; 