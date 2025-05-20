import React from 'react';
import { AnimatedElement } from './AnimatedElement';
import { useLocation } from 'react-router-dom';

interface AnimatedPageProps {
  children: React.ReactNode;
  className?: string;
}

export const AnimatedPage: React.FC<AnimatedPageProps> = ({ children, className = '' }) => {
  const location = useLocation();

  return (
    <AnimatedElement
      key={location.pathname}
      animation="fadeIn"
      duration={300}
      className={`min-h-screen ${className}`}
    >
      {children}
    </AnimatedElement>
  );
}; 