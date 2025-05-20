import React, { useState } from 'react';
import { AnimatedElement } from './AnimatedElement';

interface AnimatedListProps {
  items: React.ReactNode[];
  animation?: 'fadeIn' | 'slideInUp' | 'slideInDown' | 'slideInLeft' | 'slideInRight' | 'scaleIn';
  staggerDelay?: number;
  className?: string;
  itemClassName?: string;
  onItemClick?: (index: number) => void;
  onItemHover?: (index: number) => void;
  onItemLeave?: (index: number) => void;
  selectedIndex?: number;
  hoverable?: boolean;
  selectable?: boolean;
}

export const AnimatedList: React.FC<AnimatedListProps> = ({
  items,
  animation = 'fadeIn',
  staggerDelay = 50,
  className = '',
  itemClassName = '',
  onItemClick,
  onItemHover,
  onItemLeave,
  selectedIndex,
  hoverable = false,
  selectable = false,
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const handleItemClick = (index: number) => {
    if (selectable) {
      onItemClick?.(index);
    }
  };

  const handleItemHover = (index: number) => {
    if (hoverable) {
      setHoveredIndex(index);
      onItemHover?.(index);
    }
  };

  const handleItemLeave = (index: number) => {
    if (hoverable) {
      setHoveredIndex(null);
      onItemLeave?.(index);
    }
  };

  const getItemClasses = (index: number) => {
    const baseClasses = 'transition-all duration-300';
    const stateClasses = hoverable ? 'hover:bg-background-secondary' : '';
    const selectedClasses = selectedIndex === index ? 'bg-primary/10' : '';
    const hoveredClasses = hoveredIndex === index ? 'bg-background-secondary' : '';

    return `${baseClasses} ${stateClasses} ${selectedClasses} ${hoveredClasses} ${itemClassName}`;
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {items.map((item, index) => (
        <AnimatedElement
          key={index}
          show={true}
          animation={animation}
          duration={300}
          delay={index * staggerDelay}
          className={getItemClasses(index)}
          onClick={() => handleItemClick(index)}
          onMouseEnter={() => handleItemHover(index)}
          onMouseLeave={() => handleItemLeave(index)}
        >
          {item}
        </AnimatedElement>
      ))}
    </div>
  );
}; 