import { useState, useEffect } from 'react';
import { Menu } from '@headlessui/react';
import { useNavigate } from 'react-router-dom';
import { RiUserLine, RiLogoutBoxLine, RiSettings4Line } from 'react-icons/ri';
import { useAuth } from '../context/AuthContext';
import styles from './UserMenu.module.css';

export const UserMenu = () => {
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
    <Menu as="div" className="relative">
      <div>
        <Menu.Button className={styles.menuButton}>
          {avatarUrl ? (
            <div className={styles.avatarContainer}>
              <img 
                src={avatarUrl} 
                alt="Profile" 
                className={styles.avatarImage}
                onError={() => setAvatarUrl(null)}
              />
            </div>
          ) : (
            <span>{initials}</span>
          )}
        </Menu.Button>
      </div>

      <Menu.Items className={styles.menuItems}>
        <div className="px-1 py-1">
          {/* User Info with Avatar */}
          {user?.email && (
            <div className={styles.userInfo}>
              {avatarUrl && (
                <img 
                  src={avatarUrl} 
                  alt="Profile" 
                  className={styles.userAvatar}
                />
              )}
              <div className={styles.userDetails}>
                <span className={styles.userName}>{user.email.split('@')[0]}</span>
                <span className={styles.userEmail}>{user.email}</span>
              </div>
            </div>
          )}

          <Menu.Item>
            {({ active }) => (
              <button
                className={`${styles.menuItem} ${active ? styles.menuItemActive : ''}`}
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
                className={`${styles.menuItem} ${active ? styles.menuItemActive : ''}`}
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
                className={`${styles.menuItem} ${active ? styles.menuItemActive : ''}`}
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