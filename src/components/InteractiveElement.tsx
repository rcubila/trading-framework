import React, { useState } from 'react';
import { AnimatedElement } from './AnimatedElement';

interface InteractiveElementProps {
  children: React.ReactNode;
  type?: 'button' | 'link' | 'card' | 'input';
  animation?: 'fadeIn' | 'slideInUp' | 'scaleIn' | 'bounce';
  duration?: number;
  className?: string;
  onClick?: () => void;
  onHover?: () => void;
  onFocus?: () => void;
  disabled?: boolean;
  loading?: boolean;
  active?: boolean;
}

export const InteractiveElement: React.FC<InteractiveElementProps> = ({
  children,
  type = 'button',
  animation = 'fadeIn',
  duration = 300,
  className = '',
  onClick,
  onHover,
  onFocus,
  disabled = false,
  loading = false,
  active = false,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const handleMouseEnter = () => {
    if (!disabled && !loading) {
      setIsHovered(true);
      onHover?.();
    }
  };

  const handleMouseLeave = () => {
    if (!disabled && !loading) {
      setIsHovered(false);
    }
  };

  const handleFocus = () => {
    if (!disabled && !loading) {
      setIsFocused(true);
      onFocus?.();
    }
  };

  const handleBlur = () => {
    if (!disabled && !loading) {
      setIsFocused(false);
    }
  };

  const handleClick = () => {
    if (!disabled && !loading) {
      onClick?.();
    }
  };

  const getBaseClasses = () => {
    const baseClasses = 'transition-all duration-300';
    const stateClasses = disabled
      ? 'opacity-50 cursor-not-allowed'
      : loading
      ? 'opacity-75 cursor-wait'
      : 'cursor-pointer';

    switch (type) {
      case 'button':
        return `${baseClasses} ${stateClasses} px-4 py-2 rounded-md bg-primary text-white hover:bg-primary-dark focus:ring-2 focus:ring-primary focus:ring-offset-2`;
      case 'link':
        return `${baseClasses} ${stateClasses} text-primary hover:text-primary-dark underline`;
      case 'card':
        return `${baseClasses} ${stateClasses} p-4 rounded-lg border border-border-light hover:border-primary hover:shadow-md`;
      case 'input':
        return `${baseClasses} ${stateClasses} px-3 py-2 rounded-md border border-border-light focus:border-primary focus:ring-1 focus:ring-primary`;
      default:
        return baseClasses;
    }
  };

  const getAnimationStyle = () => {
    if (disabled || loading) return {};

    const baseStyle = {
      transform: 'scale(1)',
      transition: `all ${duration}ms ease-in-out`,
    };

    if (isHovered) {
      baseStyle.transform = 'scale(1.05)';
    }

    if (isFocused) {
      baseStyle.transform = 'scale(1.02)';
    }

    if (active) {
      baseStyle.transform = 'scale(0.98)';
    }

    return baseStyle;
  };

  return (
    <AnimatedElement
      show={true}
      animation={animation}
      duration={duration}
      className={`${getBaseClasses()} ${className}`}
      style={getAnimationStyle()}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {loading ? (
        <div className="flex items-center justify-center">
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        children
      )}
    </AnimatedElement>
  );
}; 