import React from 'react';
import { Menu } from '@headlessui/react';
import { RiPaletteLine, RiSunLine, RiMoonLine } from 'react-icons/ri';
import { useTheme } from '../../context/ThemeContext';
import styles from './ThemeToggle.module.css';

export const ThemeToggle = () => {
  const { theme, setThemeMode, setThemeColor } = useTheme();

  const colorOptions = [
    { value: 'blue', label: 'Blue', gradient: 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)' },
    { value: 'purple', label: 'Purple', gradient: 'linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)' },
    { value: 'green', label: 'Green', gradient: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)' },
    { value: 'orange', label: 'Orange', gradient: 'linear-gradient(135deg, #f97316 0%, #fb923c 100%)' },
    { value: 'red', label: 'Red', gradient: 'linear-gradient(135deg, #ef4444 0%, #f87171 100%)' },
  ] as const;

  return (
    <Menu as="div" className={styles.container}>
      <Menu.Button className={styles.button}>
        <RiPaletteLine className={styles.icon} />
        <span className={styles.label}>Theme</span>
      </Menu.Button>

      <Menu.Items className={styles.menu}>
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Mode</h3>
          <div className={styles.modeOptions}>
            <button
              className={`${styles.modeButton} ${theme.mode === 'light' ? styles.active : ''}`}
              onClick={() => setThemeMode('light')}
            >
              <RiSunLine />
              <span>Light</span>
            </button>
            <button
              className={`${styles.modeButton} ${theme.mode === 'dark' ? styles.active : ''}`}
              onClick={() => setThemeMode('dark')}
            >
              <RiMoonLine />
              <span>Dark</span>
            </button>
          </div>
        </div>

        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Color</h3>
          <div className={styles.colorOptions}>
            {colorOptions.map((color) => (
              <button
                key={color.value}
                className={`${styles.colorButton} ${theme.color === color.value ? styles.active : ''}`}
                onClick={() => setThemeColor(color.value)}
                style={{ background: color.gradient }}
                title={color.label}
              />
            ))}
          </div>
        </div>
      </Menu.Items>
    </Menu>
  );
}; 