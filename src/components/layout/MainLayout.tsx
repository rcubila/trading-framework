import React from 'react';
import { useRouter } from 'next/router';
import Navigation from './Navigation';
import UserMenu from './UserMenu';
import styles from './MainLayout.module.css';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const router = useRouter();
  const isAuthPage = router.pathname === '/auth';

  if (isAuthPage) {
    return <>{children}</>;
  }

  return (
    <div className={styles.layout}>
      <Navigation />
      <main className={styles.main}>
        <header className={styles.header}>
          <div className={styles.headerContent}>
            <div className={styles.spacer} />
            <UserMenu />
          </div>
        </header>
        {children}
      </main>
    </div>
  );
};

export default MainLayout; 