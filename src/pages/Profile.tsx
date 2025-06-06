import React from 'react';
import { useAuth } from '../context/AuthContext';
import styles from './Profile.module.css';
import { PageHeader } from '../components/PageHeader/PageHeader';

export const Profile: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <PageHeader 
          title="Profile"
          subtitle="Manage your account settings and preferences"
        />
        
        <div className={styles.profileSection}>
          <div className={styles.field}>
            <label className={styles.label}>Email</label>
            <div className={styles.value}>{user?.email}</div>
          </div>
        </div>
      </div>
    </div>
  );
}; 