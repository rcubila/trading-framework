import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AnimatedElement } from './AnimatedElement';
import { StaggeredList } from './StaggeredList';

interface NavItem {
  label: string;
  path: string;
  icon?: React.ReactNode;
}

interface AnimatedNavProps {
  items: NavItem[];
  className?: string;
}

export const AnimatedNav: React.FC<AnimatedNavProps> = ({ items, className = '' }) => {
  const location = useLocation();
  const [isHovered, setIsHovered] = useState<string | null>(null);

  const navItems = items.map((item) => (
    <Link
      key={item.path}
      to={item.path}
      className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors
                 ${location.pathname === item.path 
                   ? 'bg-primary-main text-primary-text' 
                   : 'hover:bg-background-secondary text-text-secondary hover:text-text-primary'}`}
      onMouseEnter={() => setIsHovered(item.path)}
      onMouseLeave={() => setIsHovered(null)}
    >
      {item.icon && (
        <AnimatedElement
          animation={isHovered === item.path ? 'pulse' : 'fadeIn'}
          infinite={isHovered === item.path}
        >
          {item.icon}
        </AnimatedElement>
      )}
      <span>{item.label}</span>
      {location.pathname === item.path && (
        <AnimatedElement
          animation="scaleIn"
          className="absolute bottom-0 left-0 w-full h-0.5 bg-primary-main"
        >
          <div className="w-full h-full" />
        </AnimatedElement>
      )}
    </Link>
  ));

  return (
    <nav className={`flex flex-col gap-1 ${className}`}>
      <StaggeredList
        items={navItems}
        itemClassName="relative"
        delay={100}
      />
    </nav>
  );
}; 