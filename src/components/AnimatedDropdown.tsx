import React, { useState, useRef, useEffect } from 'react';
import { AnimatedElement } from './AnimatedElement';

interface DropdownItem {
  id: string;
  label: string;
  onClick?: () => void;
}

interface AnimatedDropdownProps {
  trigger: React.ReactNode;
  items: DropdownItem[];
  className?: string;
  menuClassName?: string;
  itemClassName?: string;
}

export const AnimatedDropdown: React.FC<AnimatedDropdownProps> = ({
  trigger,
  items,
  className = '',
  menuClassName = '',
  itemClassName = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`relative inline-block ${className}`} ref={dropdownRef}>
      <div onClick={() => setIsOpen(!isOpen)}>{trigger}</div>
      <AnimatedElement
        show={isOpen}
        animation="fadeIn"
        className={`absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-background-primary
          border border-border-light overflow-hidden z-50 ${menuClassName}`}
      >
        <div className="py-1">
          {items.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                item.onClick?.();
                setIsOpen(false);
              }}
              className={`w-full px-4 py-2 text-left hover:bg-background-secondary
                transition-colors duration-200 ${itemClassName}`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </AnimatedElement>
    </div>
  );
}; 