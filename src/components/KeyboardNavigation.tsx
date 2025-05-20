import React, { useEffect, useRef } from 'react';
import { AnimatedElement } from './AnimatedElement';

interface KeyboardNavigationProps {
  children: React.ReactNode;
  className?: string;
  onFocus?: () => void;
  onBlur?: () => void;
  onKeyDown?: (event: React.KeyboardEvent) => void;
  tabIndex?: number;
  role?: string;
  ariaLabel?: string;
}

export const KeyboardNavigation: React.FC<KeyboardNavigationProps> = ({
  children,
  className = '',
  onFocus,
  onBlur,
  onKeyDown,
  tabIndex = 0,
  role,
  ariaLabel,
}) => {
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!elementRef.current) return;

      switch (event.key) {
        case 'Enter':
        case ' ':
          event.preventDefault();
          elementRef.current.click();
          break;
        case 'ArrowUp':
          event.preventDefault();
          focusNextElement('up');
          break;
        case 'ArrowDown':
          event.preventDefault();
          focusNextElement('down');
          break;
        case 'ArrowLeft':
          event.preventDefault();
          focusNextElement('left');
          break;
        case 'ArrowRight':
          event.preventDefault();
          focusNextElement('right');
          break;
        case 'Escape':
          event.preventDefault();
          elementRef.current.blur();
          break;
      }
    };

    const element = elementRef.current;
    if (element) {
      element.addEventListener('keydown', handleKeyDown);
      return () => element.removeEventListener('keydown', handleKeyDown);
    }
  }, []);

  const focusNextElement = (direction: 'up' | 'down' | 'left' | 'right') => {
    const focusableElements = Array.from(
      document.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
    );

    const currentIndex = focusableElements.indexOf(elementRef.current!);
    let nextIndex = currentIndex;

    switch (direction) {
      case 'up':
      case 'left':
        nextIndex = currentIndex > 0 ? currentIndex - 1 : focusableElements.length - 1;
        break;
      case 'down':
      case 'right':
        nextIndex = currentIndex < focusableElements.length - 1 ? currentIndex + 1 : 0;
        break;
    }

    (focusableElements[nextIndex] as HTMLElement)?.focus();
  };

  return (
    <AnimatedElement
      show={true}
      animation="fadeIn"
      className={`focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
        focus:ring-offset-background-primary ${className}`}
    >
      <div
        ref={elementRef}
        tabIndex={tabIndex}
        role={role}
        aria-label={ariaLabel}
        onFocus={onFocus}
        onBlur={onBlur}
        onKeyDown={onKeyDown}
      >
        {children}
      </div>
    </AnimatedElement>
  );
}; 