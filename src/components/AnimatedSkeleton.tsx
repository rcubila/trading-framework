import React from 'react';
import { AnimatedElement } from './AnimatedElement';

interface AnimatedSkeletonProps {
  type?: 'text' | 'circle' | 'rect' | 'avatar';
  width?: string | number;
  height?: string | number;
  className?: string;
  count?: number;
}

export const AnimatedSkeleton: React.FC<AnimatedSkeletonProps> = ({
  type = 'text',
  width,
  height,
  className = '',
  count = 1,
}) => {
  const baseClasses = 'bg-background-secondary animate-pulse';

  const typeClasses = {
    text: 'rounded',
    circle: 'rounded-full',
    rect: 'rounded-md',
    avatar: 'rounded-full',
  };

  const defaultDimensions = {
    text: { width: '100%', height: '1rem' },
    circle: { width: '2rem', height: '2rem' },
    rect: { width: '100%', height: '8rem' },
    avatar: { width: '3rem', height: '3rem' },
  };

  const dimensions = {
    width: width || defaultDimensions[type].width,
    height: height || defaultDimensions[type].height,
  };

  const renderSkeleton = () => (
    <AnimatedElement
      show={true}
      animation="shimmer"
      className={`${baseClasses} ${typeClasses[type]} ${className}`}
      style={dimensions}
    />
  );

  if (count === 1) {
    return renderSkeleton();
  }

  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, index) => (
        <React.Fragment key={index}>{renderSkeleton()}</React.Fragment>
      ))}
    </div>
  );
}; 