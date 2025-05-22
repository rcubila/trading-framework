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

  // Responsive sidebar styles
  const sidebarBase = {
    width: '16rem',
    minWidth: '4rem',
    background: 'rgba(15, 23, 42, 0.6)',
    backdropFilter: 'blur(10px)',
    display: 'flex',
    flexDirection: 'column' as 'column',
    height: '100vh',
    boxShadow: '2px 0 10px rgba(0, 0, 0, 0.1)',
    zIndex: 50,
    position: 'relative' as 'relative',
    overflow: 'hidden',
    transition: 'transform 0.3s ease',
  };
  const sidebarMobile = {
    position: 'fixed' as 'fixed',
    left: 0,
    top: 0,
    transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
    width: '16rem',
    minWidth: '4rem',
    height: '100vh',
    zIndex: 100,
    background: 'rgba(15, 23, 42, 0.95)',
    boxShadow: '2px 0 10px rgba(0,0,0,0.2)',
    transition: 'transform 0.3s ease',
    display: 'flex',
    flexDirection: 'column' as 'column',
    overflow: 'hidden',
  };

  // Media query for mobile
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'row', background: 'linear-gradient(130deg, #0f172a 0%, #1e1b4b 50%, #312e81 100%)', backgroundAttachment: 'fixed' }}>
      {/* Sidebar */}
      <aside
        style={isMobile ? sidebarMobile : sidebarBase}
      >
        {/* Gradient border effect */}
        <div style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: '1px',
          height: '100%',
          background: 'linear-gradient(to bottom, transparent, rgba(96, 165, 250, 0.2), rgba(167, 139, 250, 0.2), transparent)',
          boxShadow: '0 0 5px rgba(96, 165, 250, 0.1)',
          zIndex: 1,
          pointerEvents: 'none'
        }} />
        {/* Inner glow effect */}
        <div style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: '1px',
          height: '100%',
          background: 'linear-gradient(to right, transparent, rgba(255, 255, 255, 0.03))',
          filter: 'blur(1px)',
          zIndex: 0,
          pointerEvents: 'none'
        }} />
        <div style={{ 
          height: '60px', 
          display: 'flex', 
          alignItems: 'center',
          padding: '0 5px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <h1 style={{ 
            color: 'white', 
            fontSize: '20px',
            fontWeight: 'bold',
            background: 'linear-gradient(to right, #60a5fa, #a78bfa)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Trading Framework
          </h1>
        </div>
        
        <nav style={{ padding: '1rem', flex: 1 }}>
          {navigation.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '0.75rem 1rem',
                color: location.pathname === item.path ? '#fff' : 'rgba(255, 255, 255, 0.6)',
                backgroundColor: location.pathname === item.path 
                  ? 'rgba(59, 130, 246, 0.15)' 
                  : 'rgba(255, 255, 255, 0.03)',
                textDecoration: 'none',
                margin: '3px 0',
                borderRadius: '12px',
                transition: 'all 0.3s ease',
                position: 'relative',
                overflow: 'hidden',
                border: `1px solid ${location.pathname === item.path ? 'rgba(59, 130, 246, 0.2)' : 'rgba(255, 255, 255, 0.05)'}`,
              }}
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
              <span style={{ 
                fontSize: '14px',
                fontWeight: location.pathname === item.path ? '600' : '500',
                letterSpacing: '0.3px'
              }}>
                {item.name}
              </span>
              {location.pathname === item.path && (
                <motion.div
                  layoutId="activeNav"
                  style={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    height: '100%',
                    background: 'linear-gradient(90deg, rgba(59, 130, 246, 0.15) 0%, rgba(59, 130, 246, 0) 100%)',
                    borderLeft: '3px solid #3b82f6',
                    borderRadius: '12px',
                    zIndex: -1,
                  }}
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
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.4)',
            zIndex: 99,
          }}
        />
      )}
      {/* Main Content */}
      <main style={{
        flex: 1,
        minHeight: '100vh',
        background: 'rgba(15, 23, 42, 0.4)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        flexDirection: 'column',
      }}>
        {/* Header with UserMenu and Hamburger */}
        <header style={{
          height: '60px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 24px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          background: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(10px)',
          position: 'sticky',
          top: 0,
          zIndex: 30,
        }}>
          {/* Hamburger for mobile */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{
              display: isMobile ? 'block' : 'none',
              background: 'none',
              border: 'none',
              color: 'white',
              fontSize: '2rem',
              cursor: 'pointer',
            }}
            aria-label="Open sidebar"
          >
            <span>&#9776;</span>
          </button>
          <UserMenu />
        </header>
        <div style={{ flex: 1, padding: '24px' }}>
          <Outlet />
        </div>
      </main>
      <HelpButton />
    </div>
  );
}; 