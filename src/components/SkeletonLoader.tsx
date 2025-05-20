import React from 'react';
import { AnimatedElement } from './AnimatedElement';

interface SkeletonLoaderProps {
  type?: 'text' | 'circle' | 'rect';
  className?: string;
  width?: string;
  height?: string;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  type = 'text',
  className = '',
  width,
  height,
}) => {
  const baseClasses = 'bg-gray-200 animate-pulse';
  
  const typeClasses = {
    text: 'rounded',
    circle: 'rounded-full',
    rect: 'rounded-md',
  };

  const defaultDimensions = {
    text: 'h-4',
    circle: 'w-12 h-12',
    rect: 'h-24',
  };

  return (
    <AnimatedElement
      animation="fadeIn"
      className={`${baseClasses} ${typeClasses[type]} ${defaultDimensions[type]} ${className}`}
      style={{
        width: width || (type === 'circle' ? '3rem' : '100%'),
        height: height || (type === 'circle' ? '3rem' : '1rem'),
      }}
    >
      <div className="w-full h-full" />
    </AnimatedElement>
  );
}; 