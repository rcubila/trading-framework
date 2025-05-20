import React from 'react';
import { AnimatedElement } from './AnimatedElement';

interface ProgressBarProps {
  progress: number;
  className?: string;
  showPercentage?: boolean;
  color?: 'primary' | 'success' | 'warning' | 'error';
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  className = '',
  showPercentage = false,
  color = 'primary',
}) => {
  const colorClasses = {
    primary: 'bg-primary-main',
    success: 'bg-success-main',
    warning: 'bg-warning-main',
    error: 'bg-error-main',
  };

  const clampedProgress = Math.min(Math.max(progress, 0), 100);

  return (
    <div className={`w-full ${className}`}>
      <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
        <AnimatedElement
          animation="slideInLeft"
          className={`absolute top-0 left-0 h-full ${colorClasses[color]}`}
          style={{ width: `${clampedProgress}%` }}
        >
          <div className="w-full h-full" />
        </AnimatedElement>
      </div>
      {showPercentage && (
        <div className="mt-1 text-sm text-gray-600">
          {clampedProgress}%
        </div>
      )}
    </div>
  );
}; 