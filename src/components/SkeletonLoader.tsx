import React from 'react';
import styles from './SkeletonLoader.module.css';

interface SkeletonLoaderProps {
  type?: 'card' | 'text' | 'chart' | 'table';
  width?: string;
  height?: string;
  className?: string;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  type = 'card',
  width = '100%',
  height = '100%',
  className = '',
}) => {
  const getSkeletonClass = () => {
    switch (type) {
      case 'card':
        return styles.cardSkeleton;
      case 'text':
        return styles.textSkeleton;
      case 'chart':
        return styles.chartSkeleton;
      case 'table':
        return styles.tableSkeleton;
      default:
        return styles.cardSkeleton;
    }
  };

  return (
    <div
      className={`${styles.skeleton} ${getSkeletonClass()} ${className}`}
      style={{ width, height }}
    />
  );
}; 