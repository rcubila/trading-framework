import React from 'react';
import { AnimatedElement } from './AnimatedElement';

interface StaggeredListProps {
  items: React.ReactNode[];
  className?: string;
  staggerDelay?: number;
  animation?: 'fadeIn' | 'slideInUp' | 'slideInRight' | 'scaleIn';
  itemClassName?: string;
}

export const StaggeredList: React.FC<StaggeredListProps> = ({
  items,
  className = '',
  staggerDelay = 100,
  animation = 'fadeIn',
  itemClassName = '',
}) => {
  return (
    <div className={`space-y-4 ${className}`}>
      {items.map((item, index) => (
        <AnimatedElement
          key={index}
          animation={animation}
          delay={index * staggerDelay}
          className={itemClassName}
        >
          {item}
        </AnimatedElement>
      ))}
    </div>
  );
}; 