import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RiQuestionLine, RiCloseLine, RiSendPlaneFill, RiMessage2Line } from 'react-icons/ri';
import styles from './HelpButton.module.css';

export const HelpButton = () => {
  const [showHelp, setShowHelp] = useState(false);
  const [message, setMessage] = useState('');
  const [showBubble, setShowBubble] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically send the message to your backend
    console.log('Message sent:', message);
    setMessage('');
  };

  return (
    <>
      {/* Help Button with Chat Bubble */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        className={styles.container}
      >
        <AnimatePresence>
          {showBubble && !showHelp && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className={styles.bubble}
              onClick={() => {
                setShowBubble(false);
                setShowHelp(true);
              }}
            >
              <p className={styles.bubbleText}>
                <RiMessage2Line className={styles.icon} />
                Hi! Need help? 👋
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={() => {
            setShowHelp(!showHelp);
            setShowBubble(false);
          }}
          className={`${styles.helpButton} ${showHelp ? styles.active : ''}`}
        >
          {showHelp ? <RiCloseLine size={28} /> : <RiMessage2Line size={24} />}
        </button>
      </motion.div>

      {/* Help Modal */}
      {showHelp && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className={styles.modal}
        >
          <div className={styles.header}>
            <h3 className={styles.title}>
              Hi there 👋
            </h3>
            <p className={styles.subtitle}>
              How can we help?
            </p>
          </div>

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.inputContainer}>
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Send us a message..."
                className={styles.input}
              />
              <button
                type="submit"
                className={styles.sendButton}
              >
                <RiSendPlaneFill size={16} />
              </button>
            </div>
          </form>
        </motion.div>
      )}
    </>
  );
}; 