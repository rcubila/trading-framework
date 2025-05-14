import { useState } from 'react';
import { motion } from 'framer-motion';
import { RiQuestionLine, RiCloseLine } from 'react-icons/ri';

export const HelpButton = () => {
  const [showHelp, setShowHelp] = useState(false);

  return (
    <>
      {/* Help Button */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 9999,
        }}
      >
        <button
          onClick={() => setShowHelp(!showHelp)}
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
            border: 'none',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(59, 130, 246, 0.5)',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.1)';
            e.currentTarget.style.boxShadow = '0 6px 16px rgba(59, 130, 246, 0.6)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.5)';
          }}
        >
          {showHelp ? <RiCloseLine size={28} /> : <RiQuestionLine size={28} />}
        </button>
      </motion.div>

      {/* Help Modal */}
      {showHelp && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          style={{
            position: 'fixed',
            bottom: '88px',
            right: '24px',
            width: '320px',
            maxHeight: '70vh',
            overflowY: 'auto',
            background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.95) 100%)',
            borderRadius: '16px',
            padding: '24px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            zIndex: 9999,
          }}
        >
          <h3 style={{
            fontSize: '18px',
            fontWeight: 'bold',
            marginBottom: '16px',
            background: 'linear-gradient(to right, #60a5fa, #a78bfa)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Trading Framework Help
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <h4 style={{ color: '#fff', marginBottom: '8px', fontSize: '14px' }}>Navigation</h4>
              <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '14px' }}>
                Use the sidebar to navigate between different sections of the application.
              </p>
            </div>
            <div>
              <h4 style={{ color: '#fff', marginBottom: '8px', fontSize: '14px' }}>Dashboard</h4>
              <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '14px' }}>
                View your trading performance, recent trades, and key metrics at a glance.
              </p>
            </div>
            <div>
              <h4 style={{ color: '#fff', marginBottom: '8px', fontSize: '14px' }}>Trade Management</h4>
              <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '14px' }}>
                Add, edit, or remove trades. Import trade data from external sources.
              </p>
            </div>
            <div>
              <h4 style={{ color: '#fff', marginBottom: '8px', fontSize: '14px' }}>Analytics</h4>
              <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '14px' }}>
                Access detailed trading statistics, charts, and performance metrics.
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </>
  );
}; 