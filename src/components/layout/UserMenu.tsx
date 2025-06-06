import React, { useState, useEffect } from 'react';
import { Menu } from '@headlessui/react';
import { useNavigate } from 'react-router-dom';
import { RiUserLine, RiLogoutBoxLine, RiSettings4Line } from 'react-icons/ri';
import { useAuth } from '../../context/AuthContext';
import styles from './UserMenu.module.css';

export const UserMenu: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [initials, setInitials] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    if (user?.email) {
      const emailName = user.email.split('@')[0];
      setInitials(emailName.substring(0, 2).toUpperCase());
      
      // Get avatar URL from user metadata (Google OAuth)
      const userMetadata = user.user_metadata;
      if (userMetadata?.avatar_url || userMetadata?.picture) {
        setAvatarUrl(userMetadata.avatar_url || userMetadata.picture);
      } else {
        setAvatarUrl(null);
      }
    }
  }, [user]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <Menu as="div" className={styles.userMenu}>
      <Menu.Button className={styles.userMenu__button}>
        {avatarUrl ? (
          <div className={styles.userMenu__avatar}>
            <img 
              src={avatarUrl} 
              alt="Profile" 
              className={styles.userMenu__avatarImage}
              onError={() => setAvatarUrl(null)}
            />
          </div>
        ) : (
          <span>{initials}</span>
        )}
      </Menu.Button>

      <Menu.Items className={styles.userMenu__dropdown}>
        <div className={styles.userMenu__content}>
          {user?.email && (
            <div className={styles.userMenu__info}>
              {avatarUrl && (
                <img 
                  src={avatarUrl} 
                  alt="Profile" 
                  className={styles.userMenu__infoAvatar}
                />
              )}
              <div className={styles.userMenu__details}>
                <span className={styles.userMenu__name}>{user.email.split('@')[0]}</span>
                <span className={styles.userMenu__email}>{user.email}</span>
              </div>
            </div>
          )}

          <Menu.Item>
            {({ active }) => (
              <button
                className={`${styles.userMenu__item} ${active ? styles['userMenu__item--active'] : ''}`}
                onClick={() => navigate('/profile')}
              >
                <RiUserLine />
                Profile
              </button>
            )}
          </Menu.Item>

          <Menu.Item>
            {({ active }) => (
              <button
                className={`${styles.userMenu__item} ${active ? styles['userMenu__item--active'] : ''}`}
                onClick={() => navigate('/settings')}
              >
                <RiSettings4Line />
                Settings
              </button>
            )}
          </Menu.Item>

          <Menu.Item>
            {({ active }) => (
              <button
                className={`${styles.userMenu__item} ${active ? styles['userMenu__item--active'] : ''}`}
                onClick={handleLogout}
              >
                <RiLogoutBoxLine />
                Logout
              </button>
            )}
          </Menu.Item>
        </div>
      </Menu.Items>
    </Menu>
  );
}; 