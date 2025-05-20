import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { AnimatedElement } from './AnimatedElement';

type AnimationType = 'fadeIn' | 'slideInUp' | 'slideInDown' | 'slideInLeft' | 'slideInRight' | 'scaleIn' | 'fadeOut' | 'scaleOut' | 'rotateIn' | 'rotateOut' | 'bounce' | 'pulse' | 'shimmer' | 'shake';

interface PageTransitionProps {
  children: React.ReactNode;
  animation?: AnimationType;
  duration?: number;
  className?: string;
  onEnter?: () => void;
  onExit?: () => void;
}

export const PageTransition: React.FC<PageTransitionProps> = ({
  children,
  animation = 'fadeIn',
  duration = 300,
  className = '',
  onEnter,
  onExit,
}) => {
  const location = useLocation();
  const [isVisible, setIsVisible] = useState(true);
  const [prevPath, setPrevPath] = useState(location.pathname);

  useEffect(() => {
    if (location.pathname !== prevPath) {
      setIsVisible(false);
      onExit?.();

      const timer = setTimeout(() => {
        setPrevPath(location.pathname);
        setIsVisible(true);
        onEnter?.();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [location.pathname, prevPath, duration, onEnter, onExit]);

  const getExitAnimation = (enterAnimation: AnimationType): AnimationType => {
    switch (enterAnimation) {
      case 'fadeIn':
        return 'fadeOut';
      case 'slideInUp':
        return 'slideInDown';
      case 'slideInDown':
        return 'slideInUp';
      case 'slideInLeft':
        return 'slideInRight';
      case 'slideInRight':
        return 'slideInLeft';
      case 'scaleIn':
        return 'scaleOut';
      default:
        return 'fadeOut';
    }
  };

  return (
    <AnimatedElement
      show={isVisible}
      animation={isVisible ? animation : getExitAnimation(animation)}
      duration={duration}
      className={`min-h-screen ${className}`}
    >
      {children}
    </AnimatedElement>
  );
}; 