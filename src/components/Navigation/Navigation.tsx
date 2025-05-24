import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import styles from './Navigation.module.css';
import { Home, BarChart2, Settings, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Navigation: React.FC = () => {
  const location = useLocation();
  const { logout } = useAuth();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className={styles.nav}>
      <div className={styles.navContent}>
        <div className={styles.navItems}>
          <Link to="/" className={`${styles.navItem} ${isActive('/') ? styles.active : ''}`}>
            <Home size={20} />
            <span>Home</span>
          </Link>
          <Link to="/playbook" className={`${styles.navItem} ${isActive('/playbook') ? styles.active : ''}`}>
            <BarChart2 size={20} />
            <span>Playbook</span>
          </Link>
          <Link to="/settings" className={`${styles.navItem} ${isActive('/settings') ? styles.active : ''}`}>
            <Settings size={20} />
            <span>Settings</span>
          </Link>
        </div>
        <button className={styles.logoutButton} onClick={logout}>
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </nav>
  );
}; 