import React, { useState } from 'react';
import { AnimatedElement } from './AnimatedElement';

interface AnimatedButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  className?: string;
  contentClassName?: string;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  animation?: 'fadeIn' | 'slideInUp' | 'scaleIn' | 'bounce';
  onHover?: () => void;
  onLeave?: () => void;
}

export const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  onClick,
  className = '',
  contentClassName = '',
  icon,
  iconPosition = 'left',
  animation = 'fadeIn',
  onHover,
  onLeave,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  const handleMouseEnter = () => {
    if (!disabled && !loading) {
      setIsHovered(true);
      onHover?.();
    }
  };

  const handleMouseLeave = () => {
    if (!disabled && !loading) {
      setIsHovered(false);
      setIsPressed(false);
      onLeave?.();
    }
  };

  const handleMouseDown = () => {
    if (!disabled && !loading) {
      setIsPressed(true);
    }
  };

  const handleMouseUp = () => {
    if (!disabled && !loading) {
      setIsPressed(false);
    }
  };

  const handleClick = () => {
    if (!disabled && !loading) {
      onClick?.();
    }
  };

  const getVariantClasses = () => {
    switch (variant) {
      case 'primary':
        return 'bg-primary text-white hover:bg-primary-dark focus:ring-2 focus:ring-primary focus:ring-offset-2';
      case 'secondary':
        return 'bg-secondary text-white hover:bg-secondary-dark focus:ring-2 focus:ring-secondary focus:ring-offset-2';
      case 'outline':
        return 'border-2 border-primary text-primary hover:bg-primary/10 focus:ring-2 focus:ring-primary focus:ring-offset-2';
      case 'ghost':
        return 'text-primary hover:bg-primary/10 focus:ring-2 focus:ring-primary focus:ring-offset-2';
      default:
        return '';
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'px-3 py-1.5 text-sm';
      case 'md':
        return 'px-4 py-2 text-base';
      case 'lg':
        return 'px-6 py-3 text-lg';
      default:
        return '';
    }
  };

  const getButtonClasses = () => {
    const baseClasses = 'inline-flex items-center justify-center rounded-md font-medium transition-all duration-300';
    const stateClasses = disabled
      ? 'opacity-50 cursor-not-allowed'
      : loading
      ? 'opacity-75 cursor-wait'
      : 'cursor-pointer';
    const variantClasses = getVariantClasses();
    const sizeClasses = getSizeClasses();

    return `${baseClasses} ${stateClasses} ${variantClasses} ${sizeClasses} ${className}`;
  };

  const getAnimationStyle = () => {
    if (disabled || loading) return {};

    const baseStyle = {
      transform: 'scale(1)',
      transition: 'all 300ms ease-in-out',
    };

    if (isHovered) {
      baseStyle.transform = 'scale(1.05)';
    }

    if (isPressed) {
      baseStyle.transform = 'scale(0.95)';
    }

    return baseStyle;
  };

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onClick={handleClick}
    >
      <AnimatedElement
        show={true}
        animation={animation}
        className={getButtonClasses()}
        style={getAnimationStyle()}
      >
        {loading ? (
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : (
          <>
            {icon && iconPosition === 'left' && (
              <span className="mr-2">{icon}</span>
            )}
            <span className={contentClassName}>{children}</span>
            {icon && iconPosition === 'right' && (
              <span className="ml-2">{icon}</span>
            )}
          </>
        )}
      </AnimatedElement>
    </div>
  );
}; 