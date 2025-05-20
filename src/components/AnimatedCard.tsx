import React, { useState } from 'react';
import { AnimatedElement } from './AnimatedElement';

interface AnimatedCardProps {
  children: React.ReactNode;
  title?: string;
  className?: string;
  onClick?: () => void;
  hoverEffect?: 'scale' | 'lift' | 'glow';
  isLoading?: boolean;
  disabled?: boolean;
  selected?: boolean;
  onHover?: () => void;
  onLeave?: () => void;
}

export const AnimatedCard: React.FC<AnimatedCardProps> = ({
  children,
  title,
  className = '',
  onClick,
  hoverEffect = 'scale',
  isLoading = false,
  disabled = false,
  selected = false,
  onHover,
  onLeave,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseEnter = () => {
    if (!disabled && !isLoading) {
      setIsHovered(true);
      onHover?.();
    }
  };

  const handleMouseLeave = () => {
    if (!disabled && !isLoading) {
      setIsHovered(false);
      onLeave?.();
    }
  };

  const handleClick = () => {
    if (!disabled && !isLoading) {
      onClick?.();
    }
  };

  const getHoverStyle = () => {
    if (disabled || isLoading) return {};

    const baseStyle = {
      transform: 'scale(1)',
      transition: 'all 300ms ease-in-out',
    };

    if (isHovered) {
      switch (hoverEffect) {
        case 'scale':
          baseStyle.transform = 'scale(1.05)';
          break;
        case 'lift':
          baseStyle.transform = 'translateY(-5px)';
          break;
        case 'glow':
          baseStyle.transform = 'scale(1.02)';
          break;
      }
    }

    if (selected) {
      baseStyle.transform = 'scale(0.98)';
    }

    return baseStyle;
  };

  const getCardClasses = () => {
    const baseClasses = 'transition-all duration-300 rounded-lg border border-border-light bg-background-primary';
    const stateClasses = disabled
      ? 'opacity-50 cursor-not-allowed'
      : isLoading
      ? 'opacity-75 cursor-wait'
      : 'cursor-pointer hover:border-primary';
    const hoverClasses = isHovered ? 'shadow-lg' : 'shadow';
    const selectedClasses = selected ? 'border-primary' : '';

    return `${baseClasses} ${stateClasses} ${hoverClasses} ${selectedClasses} ${className}`;
  };

  return (
    <AnimatedElement
      show={true}
      animation="fadeIn"
      className={getCardClasses()}
      style={getHoverStyle()}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {title && (
        <div className="px-4 py-3 border-b border-border-light">
          <h3 className="text-lg font-medium text-text-primary">{title}</h3>
        </div>
      )}
      <div className="p-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          children
        )}
      </div>
    </AnimatedElement>
  );
}; 