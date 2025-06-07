import React from 'react';
import styles from './SkeletonLoader.module.css';

interface SkeletonLoaderProps {
  width?: string;
  height?: string;
  borderRadius?: string;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  width = '100%',
  height = '1rem',
  borderRadius = '4px'
}) => {
  return (
    <div
      className={styles.skeleton}
      style={{
        width,
        height,
        borderRadius
      }}
    />
  );
}; 