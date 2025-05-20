import React, { useEffect, useState } from 'react';
import { animationPresets, getAnimationStyle, durations, easings } from '../styles/animations';

interface AnimatedElementProps {
  children: React.ReactNode;
  animation?: keyof typeof animationPresets;
  duration?: number;
  easing?: keyof typeof easings;
  delay?: number;
  className?: string;
  onAnimationEnd?: () => void;
  onClick?: () => void;
  show?: boolean;
  infinite?: boolean;
  style?: React.CSSProperties;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export const AnimatedElement: React.FC<AnimatedElementProps> = ({
  children,
  animation = 'fadeIn',
  duration,
  easing,
  delay = 0,
  className = '',
  onAnimationEnd,
  onClick,
  show = true,
  infinite = false,
  style = {},
  onMouseEnter,
  onMouseLeave,
}) => {
  const [isVisible, setIsVisible] = useState(show);
  const [animationStyle, setAnimationStyle] = useState<React.CSSProperties>({});

  useEffect(() => {
    if (show) {
      setIsVisible(true);
    } else {
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, duration || durations.normal);
      return () => clearTimeout(timer);
    }
  }, [show, duration]);

  useEffect(() => {
    const baseStyle = getAnimationStyle(animation, duration, easing);
    setAnimationStyle({
      ...baseStyle,
      animationDelay: `${delay}ms`,
      animationIterationCount: infinite ? 'infinite' : 1,
      ...style,
    });
  }, [animation, duration, easing, delay, infinite, style]);

  if (!isVisible) return null;

  return (
    <div
      className={className}
      style={animationStyle}
      onAnimationEnd={onAnimationEnd}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {children}
    </div>
  );
}; 