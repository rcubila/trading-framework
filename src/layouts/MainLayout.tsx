import type { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  RiDashboardLine, 
  RiExchangeLine, 
  RiBookReadLine,
  RiLightbulbLine,
  RiMedalLine,
  RiDownloadLine
} from 'react-icons/ri';

const navigation = [
  { name: 'Dashboard', icon: RiDashboardLine, path: '/' },
  { name: 'Trades', icon: RiExchangeLine, path: '/trades' },
  { name: 'Journal', icon: RiBookReadLine, path: '/journal' },
  { name: 'Strategy', icon: RiLightbulbLine, path: '/strategy' },
  { name: 'Discipline Tracker', icon: RiMedalLine, path: '/discipline' },
  { name: 'Import Trades', icon: RiDownloadLine, path: '/import' },
];

export const MainLayout = ({ children }: { children: ReactNode }) => {
  const location = useLocation();
  
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <aside style={{ 
        width: '256px', 
        backgroundColor: '#1a1a1a',
        borderRight: '1px solid #333',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <div style={{ 
          height: '64px', 
          display: 'flex', 
          alignItems: 'center',
          padding: '0 20px',
          borderBottom: '1px solid #333'
        }}>
          <h1 style={{ color: 'white', fontSize: '20px' }}>Trading Framework</h1>
        </div>
        <nav style={{ padding: '20px 0' }}>
          {navigation.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '12px 20px',
                color: location.pathname === item.path ? '#fff' : '#888',
                backgroundColor: location.pathname === item.path ? '#2563eb' : 'transparent',
                textDecoration: 'none',
                margin: '2px 8px',
                borderRadius: '6px'
              }}
            >
              <item.icon style={{ width: '20px', height: '20px' }} />
              <span style={{ marginLeft: '12px' }}>{item.name}</span>
            </Link>
          ))}
        </nav>
      </aside>
      <main style={{ flex: 1, backgroundColor: '#111', padding: '20px' }}>
        {children}
      </main>
    </div>
  );
}; 