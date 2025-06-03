import React, { useState } from 'react';
import { IconSelector } from './IconSelector';
import styles from './CreatePlaybookModal.module.css';

interface CreatePlaybookModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (playbook: {
    asset: string;
    title: string;
    type: string;
    tags: string;
    description: string;
    icon: string;
  }) => Promise<void>;
}

export const CreatePlaybookModal: React.FC<CreatePlaybookModalProps> = ({
  isOpen,
  onClose,
  onCreate,
}) => {
  const [newPlaybook, setNewPlaybook] = useState({
    asset: '',
    title: '',
    type: '',
    tags: '',
    description: '',
    icon: '',
  });

  if (!isOpen) return null;

  const handleSubmit = async () => {
    await onCreate(newPlaybook);
    setNewPlaybook({
      asset: '',
      title: '',
      type: '',
      tags: '',
      description: '',
      icon: '',
    });
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <h2 className={styles.modalTitle}>New Playbook</h2>
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Asset</label>
          <input
            type="text"
            className={styles.formInput}
            value={newPlaybook.asset}
            onChange={e => setNewPlaybook({ ...newPlaybook, asset: e.target.value })}
            placeholder="e.g., GER40, GOLD, etc."
          />
        </div>
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Strategy Title</label>
          <input
            type="text"
            className={styles.formInput}
            value={newPlaybook.title}
            onChange={e => setNewPlaybook({ ...newPlaybook, title: e.target.value })}
            placeholder="e.g., Morning Breakout, Range Trading"
          />
        </div>
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Type</label>
          <input
            type="text"
            className={styles.formInput}
            value={newPlaybook.type}
            onChange={e => setNewPlaybook({ ...newPlaybook, type: e.target.value })}
            placeholder="e.g., Breakout, Range, Trend"
          />
        </div>
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Tags (comma separated)</label>
          <input
            type="text"
            className={styles.formInput}
            value={newPlaybook.tags}
            onChange={e => setNewPlaybook({ ...newPlaybook, tags: e.target.value })}
            placeholder="e.g., morning session, gap-up, range"
          />
        </div>
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Description</label>
          <textarea
            className={styles.formTextarea}
            rows={3}
            value={newPlaybook.description}
            onChange={e => setNewPlaybook({ ...newPlaybook, description: e.target.value })}
            placeholder="Describe your strategy..."
          />
        </div>
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Icon</label>
          <IconSelector
            selectedIcon={newPlaybook.icon || 'trending-up'}
            onSelectIcon={(icon) => setNewPlaybook({ ...newPlaybook, icon })}
          />
        </div>
        <div className={styles.formActions}>
          <button
            onClick={onClose}
            className={styles.cancelButton}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className={styles.primaryButton}
            disabled={!newPlaybook.asset.trim()}
            title={!newPlaybook.asset.trim() ? "Please enter an asset name" : ""}
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
}; 