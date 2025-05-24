import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RiCloseLine } from 'react-icons/ri';
import { supabase } from '../lib/supabaseClient';
import type { TradingRule } from '../types/discipline';
import styles from './AddRuleModal.module.css';

interface AddRuleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRuleAdded: (rule: TradingRule) => void;
}

export const AddRuleModal = ({ isOpen, onClose, onRuleAdded }: AddRuleModalProps) => {
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    description: '',
    importance: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user logged in');

      const { data, error } = await supabase
        .from('trading_rules')
        .insert({
          user_id: user.id,
          name: formData.name,
          category: formData.category,
          description: formData.description,
          importance: formData.importance
        })
        .select()
        .single();

      if (error) throw error;
      if (data) {
        onRuleAdded(data);
        onClose();
        setFormData({
          name: '',
          category: '',
          description: '',
          importance: ''
        });
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className={styles.modalContent}
      >
        <button
          onClick={onClose}
          className={styles.closeButton}
        >
          <RiCloseLine size={24} />
        </button>

        <h2 className={styles.modalTitle}>
          Add Trading Rule
        </h2>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label className={styles.label}>
              Rule Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter rule name"
              required
              className={styles.input}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>
              Category
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
              required
              className={styles.select}
            >
              <option value="">Select category</option>
              {['Entry', 'Exit', 'Risk Management', 'Psychology', 'Process'].map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>
              Importance
            </label>
            <select
              value={formData.importance}
              onChange={(e) => setFormData(prev => ({ ...prev, importance: e.target.value }))}
              required
              className={styles.select}
            >
              <option value="">Select importance</option>
              {['Critical', 'Important', 'Good Practice'].map(level => (
                <option key={level} value={level}>{level}</option>
              ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Enter rule description"
              required
              className={styles.textarea}
            />
          </div>

          {error && (
            <div className={styles.errorMessage}>
              {error}
            </div>
          )}

          <button
            type="submit"
            className={styles.submitButton}
            disabled={loading}
          >
            {loading ? 'Adding...' : 'Add Rule'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}; 