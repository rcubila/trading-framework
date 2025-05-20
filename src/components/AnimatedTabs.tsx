import React, { useState } from 'react';
import { AnimatedElement } from './AnimatedElement';

interface Tab {
  id: string;
  label: string;
  content: React.ReactNode;
}

interface AnimatedTabsProps {
  tabs: Tab[];
  defaultTab?: string;
  className?: string;
  tabClassName?: string;
  contentClassName?: string;
}

export const AnimatedTabs: React.FC<AnimatedTabsProps> = ({
  tabs,
  defaultTab,
  className = '',
  tabClassName = '',
  contentClassName = '',
}) => {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0].id);

  return (
    <div className={className}>
      <div className="flex space-x-1 border-b border-border-light">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg
              transition-colors duration-200 focus:outline-none
              ${
                activeTab === tab.id
                  ? 'bg-background-primary text-primary border-b-2 border-primary'
                  : 'text-text-secondary hover:text-text-primary hover:bg-background-secondary'
              }
              ${tabClassName}`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="mt-4">
        {tabs.map((tab) => (
          <AnimatedElement
            key={tab.id}
            show={activeTab === tab.id}
            animation="fadeIn"
            className={contentClassName}
          >
            {tab.content}
          </AnimatedElement>
        ))}
      </div>
    </div>
  );
}; 