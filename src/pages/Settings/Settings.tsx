import React, { useState } from 'react';
import { RiSave3Line } from 'react-icons/ri';
import styles from './Settings.module.css';

const Settings = () => {
  const [settings, setSettings] = useState({
    darkMode: true,
    notifications: true,
    timezone: 'UTC',
  });

  const handleSave = () => {
    // TODO: Implement settings save
  };

  return (
    <div className={styles.container}>
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Appearance</h2>
          <div className={styles.settingGroup}>
            <input
              type="checkbox"
              id="darkMode"
              checked={settings.darkMode}
              onChange={(e) => setSettings(prev => ({ ...prev, darkMode: e.target.checked }))}
            />
            <label htmlFor="darkMode" className={styles.settingLabel}>Dark Mode</label>
          </div>
        </div>

        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Notifications</h2>
          <div className={styles.settingGroup}>
            <input
              type="checkbox"
              id="notifications"
              checked={settings.notifications}
              onChange={(e) => setSettings(prev => ({ ...prev, notifications: e.target.checked }))}
            />
            <label htmlFor="notifications" className={styles.settingLabel}>Enable Notifications</label>
          </div>
        </div>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Time Zone</h2>
        <select
          value={settings.timezone}
          onChange={(e) => setSettings(prev => ({ ...prev, timezone: e.target.value }))}
          className={styles.settingGroup}
        >
          <option value="UTC">UTC</option>
          <option value="America/New_York">America/New_York</option>
          <option value="Europe/London">Europe/London</option>
          <option value="Asia/Tokyo">Asia/Tokyo</option>
        </select>
      </div>

      <div className={styles.section}>
        <button
          onClick={handleSave}
          className={styles.saveButton}
        >
          <RiSave3Line />
          Save Changes
        </button>
      </div>
    </div>
  );
};

export default Settings; 