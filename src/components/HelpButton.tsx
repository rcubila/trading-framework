import { useState } from 'react';
import { motion } from 'framer-motion';
import { RiQuestionLine, RiCloseLine, RiSendPlaneFill } from 'react-icons/ri';

export const HelpButton = () => {
  const [showHelp, setShowHelp] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically send the message to your backend
    console.log('Message sent:', message);
    setMessage('');
  };

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
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{
              fontSize: '24px',
              fontWeight: 'bold',
              marginBottom: '8px',
              background: 'linear-gradient(to right, #60a5fa, #a78bfa)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              Hi there 👋
            </h3>
            <p style={{ 
              color: 'rgba(255, 255, 255, 0.8)', 
              fontSize: '16px',
              marginBottom: '24px'
            }}>
              How can we help?
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ marginBottom: '24px' }}>
            <div style={{ 
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '12px',
              padding: '12px',
              display: 'flex',
              gap: '12px'
            }}>
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Send us a message..."
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: 'none',
                  color: 'white',
                  fontSize: '14px',
                  outline: 'none',
                }}
              />
              <button
                type="submit"
                style={{
                  background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '8px',
                  color: 'white',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                <RiSendPlaneFill size={16} />
              </button>
            </div>
          </form>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <h4 style={{ color: '#fff', marginBottom: '8px', fontSize: '14px' }}>Quick Links</h4>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: '1fr 1fr', 
                gap: '8px' 
              }}>
                {['Dashboard', 'Trades', 'Journal', 'Analytics'].map((item) => (
                  <button
                    key={item}
                    style={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '8px',
                      padding: '8px',
                      color: 'rgba(255, 255, 255, 0.8)',
                      fontSize: '13px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                    }}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h4 style={{ color: '#fff', marginBottom: '8px', fontSize: '14px' }}>Resources</h4>
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column',
                gap: '8px'
              }}>
                {[
                  'Documentation',
                  'Video Tutorials',
                  'FAQ',
                  'Contact Support'
                ].map((item) => (
                  <button
                    key={item}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      padding: '8px',
                      color: 'rgba(255, 255, 255, 0.6)',
                      fontSize: '13px',
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = 'white';
                      e.currentTarget.style.transform = 'translateX(4px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = 'rgba(255, 255, 255, 0.6)';
                      e.currentTarget.style.transform = 'translateX(0)';
                    }}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </>
  );
}; 