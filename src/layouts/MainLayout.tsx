import { Link, useLocation, Outlet } from 'react-router-dom';
import { 
  RiDashboardLine, 
  RiExchangeLine, 
  RiBookReadLine,
  RiLightbulbLine,
  RiMedalLine,
  RiDownloadLine,
  RiUser3Line,
  RiSettings4Line
} from 'react-icons/ri';
import { motion } from 'framer-motion';

const navigation = [
  { name: 'Dashboard', icon: RiDashboardLine, path: '/' },
  { name: 'Trades', icon: RiExchangeLine, path: '/trades' },
  { name: 'Journal', icon: RiBookReadLine, path: '/journal' },
  { name: 'Strategy', icon: RiLightbulbLine, path: '/strategy' },
  { name: 'Discipline Tracker', icon: RiMedalLine, path: '/discipline' },
  { name: 'Import Trades', icon: RiDownloadLine, path: '/import' },
];

export const MainLayout = () => {
  const location = useLocation();
  
  return (
    <div style={{ 
      display: 'flex', 
      minHeight: '100vh',
      background: 'linear-gradient(130deg, #0f172a 0%, #1e1b4b 50%, #312e81 100%)',
      backgroundAttachment: 'fixed'
    }}>
      <aside style={{ 
        width: '280px', 
        background: 'rgba(15, 23, 42, 0.6)',
        backdropFilter: 'blur(10px)',
        borderRight: '1px solid rgba(255, 255, 255, 0.1)',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        height: '100vh',
        boxShadow: '4px 0 15px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{ 
          height: '80px', 
          display: 'flex', 
          alignItems: 'center',
          padding: '0 24px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <h1 style={{ 
            color: 'white', 
            fontSize: '24px',
            fontWeight: 'bold',
            background: 'linear-gradient(to right, #60a5fa, #a78bfa)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Trading Framework
          </h1>
        </div>
        
        <nav style={{ padding: '24px 16px', flex: 1 }}>
          {navigation.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '12px 16px',
                color: location.pathname === item.path ? '#fff' : 'rgba(255, 255, 255, 0.6)',
                backgroundColor: location.pathname === item.path 
                  ? 'rgba(59, 130, 246, 0.15)' 
                  : 'transparent',
                textDecoration: 'none',
                margin: '4px 0',
                borderRadius: '12px',
                transition: 'all 0.2s ease',
                position: 'relative',
                overflow: 'hidden'
              }}
              onMouseEnter={(e) => {
                if (location.pathname !== item.path) {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                  e.currentTarget.style.color = '#fff';
                  e.currentTarget.style.transform = 'translateX(4px)';
                }
              }}
              onMouseLeave={(e) => {
                if (location.pathname !== item.path) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = 'rgba(255, 255, 255, 0.6)';
                  e.currentTarget.style.transform = 'translateX(0)';
                }
              }}
            >
              <item.icon style={{ 
                width: '20px', 
                height: '20px',
                marginRight: '12px',
                transition: 'all 0.2s ease'
              }} />
              <span style={{ 
                fontSize: '14px',
                fontWeight: location.pathname === item.path ? '600' : '400'
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

        <div style={{ 
          padding: '16px',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          gap: '12px'
        }}>
          <button style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            backgroundColor: 'transparent',
            color: 'rgba(255, 255, 255, 0.6)',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
            e.currentTarget.style.color = '#fff';
            e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = 'rgba(255, 255, 255, 0.6)';
            e.currentTarget.style.transform = 'translateY(0)';
          }}>
            <RiUser3Line size={20} />
          </button>
          <button style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            backgroundColor: 'transparent',
            color: 'rgba(255, 255, 255, 0.6)',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
            e.currentTarget.style.color = '#fff';
            e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = 'rgba(255, 255, 255, 0.6)';
            e.currentTarget.style.transform = 'translateY(0)';
          }}>
            <RiSettings4Line size={20} />
          </button>
        </div>
      </aside>
      <main style={{ 
        flex: 1, 
        marginLeft: '280px',
        minHeight: '100vh',
        background: 'rgba(15, 23, 42, 0.4)',
        backdropFilter: 'blur(10px)',
      }}>
        <Outlet />
      </main>
    </div>
  );
}; 