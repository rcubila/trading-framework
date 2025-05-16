import { useAuth } from '../context/AuthContext';

export const Profile = () => {
  const { user } = useAuth();

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px' }}>
      <h1 style={{ 
        fontSize: '24px', 
        fontWeight: 'bold',
        background: 'linear-gradient(to right, #60a5fa, #a78bfa)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        marginBottom: '24px'
      }}>
        Profile
      </h1>
      
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
  );
}; 