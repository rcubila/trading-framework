import React, { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

interface KeyboardFocusProps {
  children: React.ReactNode;
  className?: string;
}

export const KeyboardFocus: React.FC<KeyboardFocusProps> = ({ children, className = '' }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  // Reset focus when route changes
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.focus();
    }
  }, [location.pathname]);

  // Handle keyboard navigation
  const handleKeyDown = (event: React.KeyboardEvent) => {
    const container = containerRef.current;
    if (!container) return;

    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstFocusable = focusableElements[0] as HTMLElement;
    const lastFocusable = focusableElements[focusableElements.length - 1] as HTMLElement;

    // Handle Tab key
    if (event.key === 'Tab') {
      if (event.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstFocusable) {
          event.preventDefault();
          lastFocusable.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastFocusable) {
          event.preventDefault();
          firstFocusable.focus();
        }
      }
    }

    // Handle Escape key
    if (event.key === 'Escape') {
      const activeElement = document.activeElement as HTMLElement;
      if (activeElement && activeElement.blur) {
        activeElement.blur();
      }
    }

    // Handle Arrow keys for custom navigation
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
      const currentElement = document.activeElement as HTMLElement;
      if (!currentElement) return;

      const currentIndex = Array.from(focusableElements).indexOf(currentElement);
      if (currentIndex === -1) return;

      let nextIndex = currentIndex;

      switch (event.key) {
        case 'ArrowUp':
          nextIndex = Math.max(0, currentIndex - 1);
          break;
        case 'ArrowDown':
          nextIndex = Math.min(focusableElements.length - 1, currentIndex + 1);
          break;
        case 'ArrowLeft':
          nextIndex = Math.max(0, currentIndex - 1);
          break;
        case 'ArrowRight':
          nextIndex = Math.min(focusableElements.length - 1, currentIndex + 1);
          break;
      }

      if (nextIndex !== currentIndex) {
        event.preventDefault();
        (focusableElements[nextIndex] as HTMLElement).focus();
      }
    }
  };

  return (
    <div
      ref={containerRef}
      className={`outline-none ${className}`}
      tabIndex={-1}
      onKeyDown={handleKeyDown}
      role="region"
      aria-label="Keyboard navigable content"
    >
      {children}
    </div>
  );
}; 