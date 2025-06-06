import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiHome, FiList, FiBookOpen, FiGrid } from 'react-icons/fi';
import styles from './Sidebar.module.css';

const navItems = [
  { to: '/', label: 'Home', icon: <FiHome /> },
  { to: '/trades', label: 'Trades', icon: <FiList /> },
  { to: '/journal', label: 'Journal', icon: <FiBookOpen /> },
  { to: '/playbook', label: 'Playbook', icon: <FiGrid /> },
];

const Sidebar: React.FC = () => {
  const location = useLocation();

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}>
        <span className={styles.logoText}>TradeFramework</span>
      </div>
      <nav className={styles.nav}>
        <ul className={styles.navList}>
          {navItems.map((item) => {
            const isActive = location.pathname === item.to;
            return (
              <li key={item.to}>
                <Link
                  to={item.to}
                  className={`${styles.navItem} ${
                    isActive ? styles.navItemActive : styles.navItemInactive
                  }`}
                >
                  <span className={`${styles.navIcon} ${
                    isActive ? styles.navIconActive : styles.navIconInactive
                  }`}>
                    {item.icon}
                  </span>
                  <span className={styles.navLabel}>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className={styles.footer}>
        &copy; {new Date().getFullYear()} TradeFramework
      </div>
    </aside>
  );
};

export default Sidebar; 