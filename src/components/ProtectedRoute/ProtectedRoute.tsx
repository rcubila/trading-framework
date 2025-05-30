import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuth } from '../../context/AuthContext';
import { SkeletonLoader } from '../SkeletonLoader';
import styles from './ProtectedRoute.module.css';

interface ProtectedRouteProps {
  children: ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingContent}>
          <SkeletonLoader type="avatar" width="64px" height="64px" rounded animation="pulse" />
          <SkeletonLoader type="text" width="200px" height="24px" className={styles.titleSkeleton} />
          <SkeletonLoader type="text" width="150px" height="16px" className={styles.subtitleSkeleton} />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Save the attempted URL
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  return <>{children}</>;
}; 