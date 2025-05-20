import React from 'react';
import { AnimatedElement } from './AnimatedElement';

interface AnimatedRouteProps {
  children: React.ReactNode;
  animation?: 'fade' | 'slide' | 'scale' | 'rotate';
  duration?: number;
  className?: string;
}

export const AnimatedRoute: React.FC<AnimatedRouteProps> = ({
  children,
  animation = 'fade',
  duration = 300,
  className = '',
}) => {
  const getAnimation = () => {
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

  return (
    <AnimatedElement
      show={true}
      animation={getAnimation()}
      duration={duration}
      className={`w-full h-full ${className}`}
    >
      {children}
    </AnimatedElement>
  );
}; 