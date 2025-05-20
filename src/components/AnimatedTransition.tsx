import React, { useState, useEffect } from 'react';
import { AnimatedElement } from './AnimatedElement';

interface AnimatedTransitionProps {
  children: React.ReactNode;
  show: boolean;
  animation?: 'fade' | 'slide' | 'scale' | 'rotate';
  duration?: number;
  className?: string;
  onEnter?: () => void;
  onExit?: () => void;
}

export const AnimatedTransition: React.FC<AnimatedTransitionProps> = ({
  children,
  show,
  animation = 'fade',
  duration = 300,
  className = '',
  onEnter,
  onExit,
}) => {
  const [isVisible, setIsVisible] = useState(show);

  useEffect(() => {
    if (show) {
      setIsVisible(true);
      onEnter?.();
    } else {
      const timer = setTimeout(() => {
        setIsVisible(false);
        onExit?.();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [show, duration, onEnter, onExit]);

  const getAnimation = () => {
    if (!show) {
      switch (animation) {
        case 'fade':
          return 'fadeOut';
        case 'slide':
          return 'slideInDown';
        case 'scale':
          return 'scaleOut';
        case 'rotate':
          return 'rotateOut';
        default:
          return 'fadeOut';
      }
    }

    switch (animation) {
      case 'fade':
        return 'fadeIn';
      case 'slide':
        return 'slideInUp';
      case 'scale':
        return 'scaleIn';
      case 'rotate':
        return 'rotateIn';
      default:
        return 'fadeIn';
    }
  };

  if (!isVisible && !show) {
    return null;
  }

  return (
    <AnimatedElement
      show={show}
      animation={getAnimation()}
      duration={duration}
      className={className}
    >
      {children}
    </AnimatedElement>
  );
}; 