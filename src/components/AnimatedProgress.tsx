import React, { useEffect, useState } from 'react';
import { AnimatedElement } from './AnimatedElement';

interface AnimatedProgressProps {
  value: number;
  max?: number;
  type?: 'line' | 'circle';
  size?: 'sm' | 'md' | 'lg';
  showValue?: boolean;
  className?: string;
  trackClassName?: string;
  indicatorClassName?: string;
  valueClassName?: string;
}

export const AnimatedProgress: React.FC<AnimatedProgressProps> = ({
  value,
  max = 100,
  type = 'line',
  size = 'md',
  showValue = false,
  className = '',
  trackClassName = '',
  indicatorClassName = '',
  valueClassName = '',
}) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDisplayValue(value);
    }, 100);
    return () => clearTimeout(timer);
  }, [value]);

  const sizeClasses = {
    sm: type === 'line' ? 'h-1' : 'w-16 h-16',
    md: type === 'line' ? 'h-2' : 'w-24 h-24',
    lg: type === 'line' ? 'h-3' : 'w-32 h-32',
  };

  const percentage = (displayValue / max) * 100;

  if (type === 'line') {
    return (
      <div className={`relative ${className}`}>
        <div
          className={`w-full bg-background-secondary rounded-full overflow-hidden
            ${sizeClasses[size]} ${trackClassName}`}
        >
          <AnimatedElement
            show={true}
            animation="slideInUp"
            className={`h-full bg-primary transition-all duration-500
              ${indicatorClassName}`}
            style={{ width: `${percentage}%` }}
          >
            <div className="w-full h-full" />
          </AnimatedElement>
        </div>
        {showValue && (
          <span
            className={`absolute right-0 -top-6 text-sm text-text-secondary
              ${valueClassName}`}
          >
            {Math.round(percentage)}%
          </span>
        )}
      </div>
    );
  }

  // Circle progress
  const radius = size === 'sm' ? 30 : size === 'md' ? 45 : 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className={`relative inline-block ${className}`}>
      <svg
        className={`transform -rotate-90 ${sizeClasses[size]}`}
        viewBox={`0 0 ${radius * 2} ${radius * 2}`}
      >
        <circle
          className={`stroke-background-secondary ${trackClassName}`}
          fill="none"
          strokeWidth="4"
          cx={radius}
          cy={radius}
          r={radius}
        />
        <circle
          className={`stroke-primary transition-all duration-500
            ${indicatorClassName}`}
          style={{
            strokeDasharray: circumference,
            strokeDashoffset,
          }}
          fill="none"
          strokeWidth="4"
          cx={radius}
          cy={radius}
          r={radius}
        />
      </svg>
      {showValue && (
        <span
          className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2
            text-sm font-medium text-text-primary ${valueClassName}`}
        >
          {Math.round(percentage)}%
        </span>
      )}
    </div>
  );
}; 