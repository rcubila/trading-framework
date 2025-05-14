import { useState, useEffect } from 'react';
import { Menu } from '@headlessui/react';
import { useNavigate } from 'react-router-dom';
import { RiUserLine, RiLogoutBoxLine, RiSettings4Line } from 'react-icons/ri';
import { useAuth } from '../context/AuthContext';

export const UserMenu = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [initials, setInitials] = useState('');

  useEffect(() => {
    if (user?.email) {
      const emailName = user.email.split('@')[0];
      setInitials(emailName.substring(0, 2).toUpperCase());
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
        <Menu.Button
          className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold text-sm hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          {initials}
        </Menu.Button>
      </div>

      <Menu.Items
        className="absolute right-0 mt-2 w-56 origin-top-right divide-y divide-gray-700 rounded-md bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none transform opacity-100 scale-100"
        style={{
          zIndex: 50,
        }}
      >
        <div className="px-1 py-1">
          {user?.email && (
            <div className="px-4 py-2 text-sm text-gray-300 border-b border-gray-700">
              {user.email}
            </div>
          )}

          <Menu.Item>
            {({ active }) => (
              <button
                className={`${
                  active ? 'bg-gray-700 text-white' : 'text-gray-300'
                } group flex w-full items-center rounded-md px-2 py-2 text-sm gap-2`}
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
                className={`${
                  active ? 'bg-gray-700 text-white' : 'text-gray-300'
                } group flex w-full items-center rounded-md px-2 py-2 text-sm gap-2`}
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
                className={`${
                  active ? 'bg-gray-700 text-white' : 'text-gray-300'
                } group flex w-full items-center rounded-md px-2 py-2 text-sm gap-2`}
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