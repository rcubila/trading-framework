import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiHome, FiList, FiBookOpen, FiGrid } from 'react-icons/fi';

const navItems = [
  { to: '/', label: 'Home', icon: <FiHome /> },
  { to: '/trades', label: 'Trades', icon: <FiList /> },
  { to: '/journal', label: 'Journal', icon: <FiBookOpen /> },
  { to: '/playbook', label: 'Playbook', icon: <FiGrid /> },
];

const Sidebar: React.FC = () => {
  const location = useLocation();

  return (
    <aside
      className="h-screen w-72 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 shadow-xl flex flex-col py-8 px-4"
      style={{ minWidth: 280 }}
    >
      <div className="mb-8 flex items-center justify-center">
        <span className="text-2xl font-bold text-indigo-400 tracking-wide">TradeFramework</span>
      </div>
      <nav className="flex-1">
        <ul className="space-y-3">
          {navItems.map((item) => {
            const isActive = location.pathname === item.to;
            return (
              <li key={item.to}>
                <Link
                  to={item.to}
                  className={`
                    flex items-center gap-3 px-5 py-4 rounded-lg transition-all
                    font-medium text-base
                    ${isActive
                      ? 'bg-gradient-to-r from-indigo-500 to-blue-500 text-white shadow-lg'
                      : 'text-slate-200 hover:bg-slate-700/60 hover:text-white'}
                  `}
                  style={{ minHeight: 56 }}
                >
                  <span className={`text-xl ${isActive ? 'text-white' : 'text-indigo-300 group-hover:text-white'}`}>
                    {item.icon}
                  </span>
                  <span className="flex-1">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="mt-auto text-xs text-slate-500 text-center opacity-70">
        &copy; {new Date().getFullYear()} TradeFramework
      </div>
    </aside>
  );
};

export default Sidebar; 