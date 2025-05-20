import React from 'react';
import { AnimatedElement } from './AnimatedElement';
import { AnimatedSkeleton } from './AnimatedSkeleton';

interface LoadingStateProps {
  type?: 'skeleton' | 'spinner' | 'progress';
  variant?: 'text' | 'card' | 'table' | 'chart';
  count?: number;
  className?: string;
  message?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  type = 'skeleton',
  variant = 'text',
  count = 1,
  className = '',
  message,
}) => {
  const renderSkeleton = () => {
    switch (variant) {
      case 'card':
        return (
          <div className="space-y-4">
            <AnimatedSkeleton type="rect" height="200px" />
            <div className="space-y-2">
              <AnimatedSkeleton type="text" width="60%" />
              <AnimatedSkeleton type="text" width="40%" />
            </div>
          </div>
        );
      case 'table':
        return (
          <div className="space-y-2">
            <AnimatedSkeleton type="text" width="100%" />
            {Array.from({ length: count }).map((_, index) => (
              <AnimatedSkeleton key={index} type="text" width="100%" />
            ))}
          </div>
        );
      case 'chart':
        return (
          <div className="space-y-4">
            <AnimatedSkeleton type="rect" height="300px" />
            <div className="flex justify-between">
              <AnimatedSkeleton type="text" width="30%" />
              <AnimatedSkeleton type="text" width="30%" />
            </div>
          </div>
        );
      default:
        return (
          <div className="space-y-2">
            {Array.from({ length: count }).map((_, index) => (
              <AnimatedSkeleton key={index} type="text" width={index === 0 ? '100%' : '80%'} />
            ))}
          </div>
        );
    }
  };

  const renderSpinner = () => (
    <div className="flex flex-col items-center justify-center space-y-4">
      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      {message && <p className="text-text-secondary">{message}</p>}
    </div>
  );

  const renderProgress = () => (
    <div className="space-y-2">
      <div className="h-2 bg-background-secondary rounded-full overflow-hidden">
        <AnimatedElement
          show={true}
          animation="slideInLeft"
          className="h-full bg-primary"
          style={{ width: '100%' }}
        >
          <div className="w-full h-full" />
        </AnimatedElement>
      </div>
      {message && <p className="text-text-secondary text-sm">{message}</p>}
    </div>
  );

  return (
    <AnimatedElement
      show={true}
      animation="fadeIn"
      className={`w-full ${className}`}
    >
      {type === 'skeleton' && renderSkeleton()}
      {type === 'spinner' && renderSpinner()}
      {type === 'progress' && renderProgress()}
    </AnimatedElement>
  );
}; 