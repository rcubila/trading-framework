import { useAuth } from '../context/AuthContext';
import { PageHeader } from '../components/PageHeader';

export const Profile = () => {
  const { user } = useAuth();

  return (
    <div style={{ 
      padding: '5px',
      color: 'white',
      background: 'linear-gradient(160deg, rgba(15, 23, 42, 0.3) 0%, rgba(30, 27, 75, 0.3) 100%)',
      minHeight: '100vh',
      backdropFilter: 'blur(10px)'
    }}>
      <PageHeader 
        title="Profile"
        subtitle="Manage your account settings and preferences"
      />
      
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px' }}>
        <div style={{
          background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.4) 0%, rgba(15, 23, 42, 0.4) 100%)',
          borderRadius: '16px',
          padding: '24px',
          border: '1px solid rgba(255, 255, 255, 0.05)',
        }}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '14px' }}>Email</label>
            <div style={{ fontSize: '16px', marginTop: '4px' }}>{user?.email}</div>
          </div>
        </div>
      </div>
    </div>
  );
}; 