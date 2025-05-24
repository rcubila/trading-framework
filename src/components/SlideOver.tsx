import React from 'react';
import { X } from 'lucide-react';
import styles from './SlideOver.module.css';

interface SlideOverProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export const SlideOver: React.FC<SlideOverProps> = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.slideOver}>
        <div className={styles.header}>
          <button className={styles.closeButton} onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        <div className={styles.content}>
          {children}
        </div>
      </div>
    </div>
  );
}; 