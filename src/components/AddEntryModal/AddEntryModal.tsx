import React from 'react';
import { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import type { DailyEntry } from '../../types/discipline';
import styles from './AddEntryModal.module.css';

interface AddEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (entry: Omit<DailyEntry, 'id'>) => void;
}

const MOOD_OPTIONS = [
  'Confident',
  'Focused',
  'Anxious',
  'Frustrated',
  'Neutral',
  'Optimistic',
  'Tired',
  'Distracted'
];

export const AddEntryModal = ({ isOpen, onClose, onSave }: AddEntryModalProps) => {
  const [rating, setRating] = useState(3);
  const [rulesFollowed, setRulesFollowed] = useState<string[]>([]);
  const [rulesBroken, setRulesBroken] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [mood, setMood] = useState('Neutral');
  const [learnings, setLearnings] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      date: new Date().toISOString(),
      rating,
      rulesFollowed,
      rulesBroken,
      notes,
      mood,
      learnings
    });
    onClose();
  };

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className={styles.modal} onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className={styles.modalOverlay} />
        </Transition.Child>

        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel>
                <div className={styles.modalHeader}>
                  <Dialog.Title as="h3" className={styles.modalTitle}>
                    Add Daily Entry
                  </Dialog.Title>
                  <button
                    type="button"
                    className={styles.closeButton}
                    onClick={onClose}
                  >
                    <span className="sr-only">Close</span>
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>

                <div className={styles.modalBody}>
                  <form onSubmit={handleSubmit} className={styles.form}>
                    {/* Rating */}
                    <div className={styles.formGroup}>
                      <label className={styles.label}>
                        How would you rate your discipline today? (1-5)
                      </label>
                      <input
                        type="range"
                        min="1"
                        max="5"
                        value={rating}
                        onChange={(e) => setRating(Number(e.target.value))}
                        className={styles.input}
                      />
                      <div className="flex justify-between text-sm text-gray-400">
                        <span>Poor</span>
                        <span>Excellent</span>
                      </div>
                    </div>

                    {/* Mood */}
                    <div className={styles.formGroup}>
                      <label className={styles.label}>
                        How are you feeling today?
                      </label>
                      <select
                        value={mood}
                        onChange={(e) => setMood(e.target.value)}
                        className={styles.select}
                      >
                        {MOOD_OPTIONS.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Rules Followed */}
                    <div className={styles.formGroup}>
                      <label className={styles.label}>
                        Rules Followed (comma-separated)
                      </label>
                      <input
                        type="text"
                        value={rulesFollowed.join(', ')}
                        onChange={(e) => setRulesFollowed(e.target.value.split(',').map(s => s.trim()))}
                        className={styles.input}
                        placeholder="e.g. Stop loss, Position sizing, Pre-trade checklist"
                      />
                    </div>

                    {/* Rules Broken */}
                    <div className={styles.formGroup}>
                      <label className={styles.label}>
                        Rules Broken (comma-separated)
                      </label>
                      <input
                        type="text"
                        value={rulesBroken.join(', ')}
                        onChange={(e) => setRulesBroken(e.target.value.split(',').map(s => s.trim()))}
                        className={styles.input}
                        placeholder="e.g. Overtrading, Revenge trading"
                      />
                    </div>

                    {/* Learnings */}
                    <div className={styles.formGroup}>
                      <label className={styles.label}>
                        Key Learnings
                      </label>
                      <textarea
                        value={learnings}
                        onChange={(e) => setLearnings(e.target.value)}
                        rows={3}
                        className={styles.textarea}
                        placeholder="What did you learn today about your trading discipline?"
                      />
                    </div>

                    {/* Notes */}
                    <div className={styles.formGroup}>
                      <label className={styles.label}>
                        Additional Notes
                      </label>
                      <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows={3}
                        className={styles.textarea}
                        placeholder="Any additional thoughts or observations..."
                      />
                    </div>

                    <div className={styles.buttonGroup}>
                      <button
                        type="button"
                        className={styles.cancelButton}
                        onClick={onClose}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className={styles.submitButton}
                      >
                        Save Entry
                      </button>
                    </div>
                  </form>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}; 