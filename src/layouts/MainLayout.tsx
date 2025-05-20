import { Link, useLocation, Outlet } from 'react-router-dom';
import { 
  RiDashboardLine, 
  RiExchangeLine, 
  RiBookReadLine,
  RiLightbulbLine,
  RiMedalLine,
  RiDownloadLine,
  RiBarChartLine,
  RiPaintBrushLine,
  RiBookLine,
} from 'react-icons/ri';
import { motion } from 'framer-motion';
import { UserMenu } from '../components/UserMenu';
import { HelpButton } from '../components/HelpButton';

const navigation = [
  { name: 'Dashboard', icon: RiDashboardLine, path: '/' },
  { name: 'Trades', icon: RiExchangeLine, path: '/trades' },
  { name: 'Analytics', icon: RiBarChartLine, path: '/analytics' },
  { name: 'Journal', icon: RiBookReadLine, path: '/journal' },
  { name: 'Strategy', icon: RiLightbulbLine, path: '/strategy' },
  { name: 'PlayBook', icon: RiBookLine, path: '/playbook' },
  { name: 'Discipline Tracker', icon: RiMedalLine, path: '/discipline' },
  { name: 'Import Trades', icon: RiDownloadLine, path: '/import' },
  { name: 'UI Recommendations', icon: RiPaintBrushLine, path: '/ui-recommendations' },
];

export const MainLayout = () => {
  const location = useLocation();
  
  return (
    <div style={{ position: 'relative', minHeight: '100vh' }}>
      <div style={{ 
        display: 'flex', 
        minHeight: '100vh',
        background: 'linear-gradient(130deg, #0f172a 0%, #1e1b4b 50%, #312e81 100%)',
        backgroundAttachment: 'fixed'
      }}>
        <aside style={{ 
          width: '200px',
          background: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
          boxShadow: '2px 0 10px rgba(0, 0, 0, 0.1)',
          zIndex: 40,
          position: 'fixed',
          overflow: 'hidden'
        }}>
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
          
          <nav style={{ padding: '5px', flex: 1 }}>
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '5px',
                  color: location.pathname === item.path ? '#fff' : 'rgba(255, 255, 255, 0.6)',
                  backgroundColor: location.pathname === item.path 
                    ? 'rgba(59, 130, 246, 0.15)' 
                    : 'transparent',
                  textDecoration: 'none',
                  margin: '3px 0',
                  borderRadius: '10px',
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
                  width: '18px', 
                  height: '18px',
                  marginRight: '5px',
                  transition: 'all 0.2s ease'
                }} />
                <span style={{ 
                  fontSize: '13px',
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
                      borderRadius: '10px',
                      zIndex: -1,
                    }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}
              </Link>
            ))}
          </nav>
        </aside>
        <main style={{ 
          flex: 1, 
          marginLeft: '200px',
          minHeight: '100vh',
          background: 'rgba(15, 23, 42, 0.4)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          flexDirection: 'column'
        }}>
          {/* Header with UserMenu */}
          <header style={{
            height: '60px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            padding: '0 24px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            background: 'rgba(15, 23, 42, 0.6)',
            backdropFilter: 'blur(10px)',
            position: 'sticky',
            top: 0,
            zIndex: 30,
          }}>
            <UserMenu />
          </header>
          <div style={{ flex: 1, padding: '24px' }}>
            <Outlet />
          </div>
        </main>
      </div>
      <HelpButton />
    </div>
  );
}; 