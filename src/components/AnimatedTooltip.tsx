import React, { useState, useRef, useEffect } from 'react';
import { AnimatedElement } from './AnimatedElement';

interface AnimatedTooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  position?: 'top' | 'right' | 'bottom' | 'left';
  delay?: number;
  className?: string;
  contentClassName?: string;
}

export const AnimatedTooltip: React.FC<AnimatedTooltipProps> = ({
  content,
  children,
  position = 'top',
  delay = 200,
  className = '',
  contentClassName = '',
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [showTimeout, setShowTimeout] = useState<NodeJS.Timeout | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = () => {
    if (showTimeout) clearTimeout(showTimeout);
    const timeout = setTimeout(() => setIsVisible(true), delay);
    setShowTimeout(timeout);
  };

  const handleMouseLeave = () => {
    if (showTimeout) clearTimeout(showTimeout);
    setIsVisible(false);
  };

  useEffect(() => {
    return () => {
      if (showTimeout) clearTimeout(showTimeout);
    };
  }, [showTimeout]);

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
  };

  return (
    <div
      className={`relative inline-block ${className}`}
      ref={tooltipRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      <AnimatedElement
        show={isVisible}
        animation="fadeIn"
        className={`absolute ${positionClasses[position]} z-50
          bg-background-primary text-text-primary px-3 py-2 rounded-md
          shadow-lg border border-border-light whitespace-nowrap
          ${contentClassName}`}
      >
        {content}
      </AnimatedElement>
    </div>
  );
}; 