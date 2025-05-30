import React from 'react';
import styles from './SkeletonLoader.module.css';

interface SkeletonLoaderProps {
  type?: 'card' | 'text' | 'chart' | 'table' | 'list' | 'avatar' | 'button' | 'input' | 'circle';
  width?: string;
  height?: string;
  className?: string;
  count?: number;
  rounded?: boolean;
  animation?: 'pulse' | 'wave' | 'shimmer';
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  type = 'card',
  width = '100%',
  height = '100%',
  className = '',
  count = 1,
  rounded = false,
  animation = 'shimmer',
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
      case 'list':
        return styles.listSkeleton;
      case 'avatar':
        return styles.avatarSkeleton;
      case 'button':
        return styles.buttonSkeleton;
      case 'input':
        return styles.inputSkeleton;
      case 'circle':
        return styles.circleSkeleton;
      default:
        return styles.cardSkeleton;
    }
  };

  const getAnimationClass = () => {
    switch (animation) {
      case 'pulse':
        return styles.pulseAnimation;
      case 'wave':
        return styles.waveAnimation;
      case 'shimmer':
        return styles.shimmerAnimation;
      default:
        return styles.shimmerAnimation;
    }
  };

  const renderSkeletons = () => {
    return Array(count).fill(null).map((_, index) => (
      <div
        key={index}
        className={`${styles.skeleton} ${getSkeletonClass()} ${getAnimationClass()} ${rounded ? styles.rounded : ''} ${className}`}
        style={{ width, height }}
      />
    ));
  };

  return <>{renderSkeletons()}</>;
}; 