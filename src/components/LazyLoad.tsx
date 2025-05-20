import React, { Suspense } from 'react';
import { LoadingState } from './LoadingState';

interface LazyLoadProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  loadingType?: 'skeleton' | 'spinner' | 'progress';
  loadingVariant?: 'text' | 'card' | 'table' | 'chart';
  loadingCount?: number;
  loadingMessage?: string;
  className?: string;
}

export const LazyLoad: React.FC<LazyLoadProps> = ({
  children,
  fallback,
  loadingType = 'skeleton',
  loadingVariant = 'text',
  loadingCount = 1,
  loadingMessage,
  className = '',
}) => {
  const defaultFallback = (
    <LoadingState
      type={loadingType}
      variant={loadingVariant}
      count={loadingCount}
      message={loadingMessage}
      className={className}
    />
  );

  return (
    <Suspense fallback={fallback || defaultFallback}>
      {children}
    </Suspense>
  );
}; 