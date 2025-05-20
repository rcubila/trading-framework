import React from 'react';
import { AnimatedElement } from './AnimatedElement';

interface ResponsiveLayoutProps {
  children: React.ReactNode;
  className?: string;
  breakpoints?: {
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  columns?: {
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  gap?: {
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  padding?: {
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
}

export const ResponsiveLayout: React.FC<ResponsiveLayoutProps> = ({
  children,
  className = '',
  breakpoints = {
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
  },
  columns = {
    sm: 1,
    md: 2,
    lg: 3,
    xl: 4,
  },
  gap = {
    sm: 16,
    md: 20,
    lg: 24,
    xl: 32,
  },
  padding = {
    sm: 16,
    md: 20,
    lg: 24,
    xl: 32,
  },
}) => {
  const getResponsiveStyles = () => {
    const styles: Record<string, string> = {
      display: 'grid',
      gridTemplateColumns: `repeat(${columns.sm}, minmax(0, 1fr))`,
      gap: `${gap.sm}px`,
      padding: `${padding.sm}px`,
    };

    if (breakpoints.md) {
      styles[`@media (min-width: ${breakpoints.md}px)`] = `
        grid-template-columns: repeat(${columns.md}, minmax(0, 1fr));
        gap: ${gap.md}px;
        padding: ${padding.md}px;
      `;
    }

    if (breakpoints.lg) {
      styles[`@media (min-width: ${breakpoints.lg}px)`] = `
        grid-template-columns: repeat(${columns.lg}, minmax(0, 1fr));
        gap: ${gap.lg}px;
        padding: ${padding.lg}px;
      `;
    }

    if (breakpoints.xl) {
      styles[`@media (min-width: ${breakpoints.xl}px)`] = `
        grid-template-columns: repeat(${columns.xl}, minmax(0, 1fr));
        gap: ${gap.xl}px;
        padding: ${padding.xl}px;
      `;
    }

    return styles;
  };

  return (
    <AnimatedElement
      show={true}
      animation="fadeIn"
      className={`grid ${className}`}
      style={getResponsiveStyles()}
    >
      {children}
    </AnimatedElement>
  );
}; 