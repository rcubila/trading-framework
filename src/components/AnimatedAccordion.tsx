import React, { useState } from 'react';
import { AnimatedElement } from './AnimatedElement';

interface AccordionItem {
  id: string;
  title: string;
  content: React.ReactNode;
}

interface AnimatedAccordionProps {
  items: AccordionItem[];
  defaultOpen?: string;
  className?: string;
  itemClassName?: string;
  titleClassName?: string;
  contentClassName?: string;
}

export const AnimatedAccordion: React.FC<AnimatedAccordionProps> = ({
  items,
  defaultOpen,
  className = '',
  itemClassName = '',
  titleClassName = '',
  contentClassName = '',
}) => {
  const [openItem, setOpenItem] = useState<string | undefined>(defaultOpen);

  const toggleItem = (id: string) => {
    setOpenItem(openItem === id ? undefined : id);
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {items.map((item) => (
        <div
          key={item.id}
          className={`border border-border-light rounded-lg overflow-hidden
            ${itemClassName}`}
        >
          <button
            onClick={() => toggleItem(item.id)}
            className={`w-full px-4 py-3 text-left flex items-center justify-between
              bg-background-primary hover:bg-background-secondary
              transition-colors duration-200 focus:outline-none
              ${titleClassName}`}
          >
            <span className="font-medium">{item.title}</span>
            <svg
              className={`w-5 h-5 transform transition-transform duration-200
                ${openItem === item.id ? 'rotate-180' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
          <AnimatedElement
            show={openItem === item.id}
            animation="slideInDown"
            className={`overflow-hidden ${contentClassName}`}
          >
            <div className="px-4 py-3 bg-background-secondary">
              {item.content}
            </div>
          </AnimatedElement>
        </div>
      ))}
    </div>
  );
}; 