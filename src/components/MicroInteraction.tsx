import React, { useState, useEffect } from 'react';
import { AnimatedElement } from './AnimatedElement';

interface MicroInteractionProps {
  children: React.ReactNode;
  type?: 'hover' | 'click' | 'focus' | 'scroll';
  animation?: 'scale' | 'rotate' | 'bounce' | 'shake' | 'pulse';
  duration?: number;
  className?: string;
  onInteractionStart?: () => void;
  onInteractionEnd?: () => void;
  threshold?: number;
  disabled?: boolean;
}

export const MicroInteraction: React.FC<MicroInteractionProps> = ({
  children,
  type = 'hover',
  animation = 'scale',
  duration = 300,
  className = '',
  onInteractionStart,
  onInteractionEnd,
  threshold = 0.5,
  disabled = false,
}) => {
  const [isActive, setIsActive] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    if (type === 'scroll') {
      const handleScroll = () => {
        const scrollPosition = window.scrollY;
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;
        const progress = scrollPosition / (documentHeight - windowHeight);
        setScrollProgress(progress);
      };

      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    }
  }, [type]);

  const handleMouseEnter = () => {
    if (type === 'hover') {
      setIsActive(true);
      onInteractionStart?.();
    }
  };

  const handleMouseLeave = () => {
    if (type === 'hover') {
      setIsActive(false);
      onInteractionEnd?.();
    }
  };

  const handleFocus = () => {
    if (type === 'focus') {
      setIsActive(true);
      onInteractionStart?.();
    }
  };

  const handleBlur = () => {
    if (type === 'focus') {
      setIsActive(false);
      onInteractionEnd?.();
    }
  };

  const handleClick = () => {
    if (type === 'click') {
      setIsActive(true);
      onInteractionStart?.();
      setTimeout(() => {
        setIsActive(false);
        onInteractionEnd?.();
      }, duration);
    }
  };

  const getAnimationStyle = () => {
    if (type === 'scroll') {
      return {
        transform: `scale(${1 + scrollProgress * 0.1})`,
        opacity: 0.5 + scrollProgress * 0.5,
      };
    }

    if (!isActive) return {};

    switch (animation) {
      case 'scale':
        return { transform: 'scale(1.05)' };
      case 'rotate':
        return { transform: 'rotate(5deg)' };
      case 'bounce':
        return { transform: 'translateY(-5px)' };
      case 'shake':
        return { transform: 'translateX(5px)' };
      case 'pulse':
        return { transform: 'scale(1.1)' };
      default:
        return {};
    }
  };

  return (
    <div
      className="inline-block"
      onFocus={handleFocus}
      onBlur={handleBlur}
      tabIndex={type === 'focus' ? 0 : undefined}
    >
      <AnimatedElement
        show={true}
        animation="fadeIn"
        className={`transition-all duration-${duration} ${className}`}
        style={getAnimationStyle()}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
      >
        {children}
      </AnimatedElement>
    </div>
  );
}; 