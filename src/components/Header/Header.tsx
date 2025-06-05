import React from 'react';
import { UserMenu } from '../UserMenu';
import styles from './Header.module.css';

interface HeaderProps {
  onMenuClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  return (
    <header className={styles.header} role="banner">
      <button
        onClick={onMenuClick}
        className={styles.header__hamburger}
        aria-label="Toggle navigation menu"
        aria-expanded="false"
        aria-controls="sidebar"
      >
        <span aria-hidden="true">&#9776;</span>
      </button>
      <UserMenu />
    </header>
  );
}; 