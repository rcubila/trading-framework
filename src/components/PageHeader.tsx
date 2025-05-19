import React from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string | React.ReactNode;
  actions?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle, actions }) => {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '2px',
      background: 'rgba(15, 23, 42, 0.4)',
      padding: '2px 5px',
      borderRadius: '16px',
      border: '1px solid rgba(255, 255, 255, 0.05)',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
    }}>
      <div>
        <h1 style={{
          fontSize: '24px',
          fontWeight: 'bold',
          marginBottom: '2px',
          background: 'linear-gradient(to right, #60a5fa, #a78bfa)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          {title}
        </h1>
        {subtitle && (
          <p style={{
            color: 'rgba(255, 255, 255, 0.6)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '13px'
          }}>
            {subtitle}
          </p>
        )}
      </div>
      {actions && (
        <div style={{ display: 'flex', gap: '5px' }}>
          {actions}
        </div>
      )}
    </div>
  );
}; 