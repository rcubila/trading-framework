import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import styles from './Navigation.module.css';

const Navigation: React.FC = () => {
  const router = useRouter();

  const isActive = (path: string) => router.pathname === path;

  return (
    <nav className={styles.nav}>
      <div className={styles.navContent}>
        <Link href="/" className={styles.logo}>
          Trading Framework
        </Link>
        <div className={styles.links}>
          <Link 
            href="/dashboard" 
            className={`${styles.link} ${isActive('/dashboard') ? styles.active : ''}`}
          >
            Dashboard
          </Link>
          <Link 
            href="/trades" 
            className={`${styles.link} ${isActive('/trades') ? styles.active : ''}`}
          >
            Trades
          </Link>
          <Link 
            href="/analysis" 
            className={`${styles.link} ${isActive('/analysis') ? styles.active : ''}`}
          >
            Analysis
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navigation; 