import { Link, useLocation, Outlet } from 'react-router-dom';
import { 
  RiDashboardLine, 
  RiExchangeLine, 
  RiBookReadLine,
  RiMedalLine,
  RiDownloadLine,
  RiBarChartLine,
  RiPaintBrushLine,
  RiBookLine,
} from 'react-icons/ri';
import { motion } from 'framer-motion';
import { UserMenu } from '../components/UserMenu';
import { HelpButton } from '../components/HelpButton';
import React, { useState } from 'react';
import styles from './MainLayout.module.css';

const navigation = [
  { name: 'Dashboard', icon: RiDashboardLine, path: '/', color: '#60a5fa' },
  { name: 'Trades', icon: RiExchangeLine, path: '/trades', color: '#34d399' },
  { name: 'Analytics', icon: RiBarChartLine, path: '/analytics', color: '#f472b6' },
  { name: 'Journal', icon: RiBookReadLine, path: '/journal', color: '#fbbf24' },
  { name: 'PlayBook', icon: RiBookLine, path: '/playbook', color: '#a78bfa' },
  { name: 'Discipline Tracker', icon: RiMedalLine, path: '/discipline', color: '#fb923c' },
  { name: 'Import Trades', icon: RiDownloadLine, path: '/import', color: '#38bdf8' },
  { name: 'UI Recommendations', icon: RiPaintBrushLine, path: '/ui-recommendations', color: '#f87171' },
];

export const MainLayout = () => {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  return (
    <div className={styles.container}>
      {/* Sidebar */}
      <aside className={`${styles.sidebar} ${isMobile ? (sidebarOpen ? styles.sidebarMobileOpen : styles.sidebarMobile) : ''}`}>
        {/* Gradient border effect */}
        <div className={styles.sidebarBorder} />
        {/* Inner glow effect */}
        <div className={styles.sidebarGlow} />
        
        <div className={styles.logo}>
          <h1 className={styles.logoText}>
            Trading Framework
          </h1>
        </div>
        
        <nav className={styles.nav}>
          {navigation.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className={`${styles.navLink} ${location.pathname === item.path ? styles.navLinkActive : ''}`}
              onMouseEnter={(e) => {
                if (location.pathname !== item.path) {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                  e.currentTarget.style.color = '#fff';
                  e.currentTarget.style.transform = 'translateX(4px)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                }
              }}
              onMouseLeave={(e) => {
                if (location.pathname !== item.path) {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.03)';
                  e.currentTarget.style.color = 'rgba(255, 255, 255, 0.6)';
                  e.currentTarget.style.transform = 'translateX(0)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.05)';
                }
              }}
            >
              <item.icon style={{ 
                width: '20px', 
                height: '20px',
                marginRight: '12px',
                color: location.pathname === item.path ? '#3b82f6' : item.color,
                transition: 'all 0.3s ease',
                transform: location.pathname === item.path ? 'scale(1.1)' : 'scale(1)'
              }} />
              <span className={`${styles.navText} ${location.pathname === item.path ? styles.navTextActive : ''}`}>
                {item.name}
              </span>
              {location.pathname === item.path && (
                <motion.div
                  layoutId="activeNav"
                  className={styles.activeIndicator}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Sidebar overlay for mobile */}
      {isMobile && sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className={styles.overlay}
        />
      )}

      {/* Main Content */}
      <main className={styles.main}>
        {/* Header with UserMenu and Hamburger */}
        <header className={styles.header}>
          {/* Hamburger for mobile */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className={styles.hamburger}
            aria-label="Open sidebar"
          >
            <span>&#9776;</span>
          </button>
          <div className={styles.header__spacer} />
          <UserMenu />
        </header>
        <div className={styles.content}>
          <Outlet />
        </div>
      </main>
      <HelpButton />
    </div>
  );
}; 