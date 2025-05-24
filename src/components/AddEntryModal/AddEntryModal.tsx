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
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-gray-800 px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                <div className="absolute right-0 top-0 hidden pr-4 pt-4 sm:block">
                  <button
                    type="button"
                    className="rounded-md bg-gray-800 text-gray-400 hover:text-gray-500 focus:outline-none"
                    onClick={onClose}
                  >
                    <span className="sr-only">Close</span>
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <Dialog.Title as="h3" className="text-lg font-semibold leading-6 text-white mb-4">
                      Add Daily Entry
                    </Dialog.Title>

                    {/* Rating */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-200 mb-2">
                        How would you rate your discipline today? (1-5)
                      </label>
                      <input
                        type="range"
                        min="1"
                        max="5"
                        value={rating}
                        onChange={(e) => setRating(Number(e.target.value))}
                        className="w-full"
                      />
                      <div className="flex justify-between text-sm text-gray-400">
                        <span>Poor</span>
                        <span>Excellent</span>
                      </div>
                    </div>

                    {/* Mood */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-200 mb-2">
                        How are you feeling today?
                      </label>
                      <select
                        value={mood}
                        onChange={(e) => setMood(e.target.value)}
                        className="mt-1 block w-full rounded-md border-0 bg-gray-700 py-1.5 pl-3 pr-10 text-white shadow-sm ring-1 ring-inset ring-gray-600 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
                      >
                        {MOOD_OPTIONS.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Rules Followed */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-200 mb-2">
                        Rules Followed (comma-separated)
                      </label>
                      <input
                        type="text"
                        value={rulesFollowed.join(', ')}
                        onChange={(e) => setRulesFollowed(e.target.value.split(',').map(s => s.trim()))}
                        className="mt-1 block w-full rounded-md border-0 bg-gray-700 py-1.5 text-white shadow-sm ring-1 ring-inset ring-gray-600 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                        placeholder="e.g. Stop loss, Position sizing, Pre-trade checklist"
                      />
                    </div>

                    {/* Rules Broken */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-200 mb-2">
                        Rules Broken (comma-separated)
                      </label>
                      <input
                        type="text"
                        value={rulesBroken.join(', ')}
                        onChange={(e) => setRulesBroken(e.target.value.split(',').map(s => s.trim()))}
                        className="mt-1 block w-full rounded-md border-0 bg-gray-700 py-1.5 text-white shadow-sm ring-1 ring-inset ring-gray-600 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                        placeholder="e.g. Overtrading, Revenge trading"
                      />
                    </div>

                    {/* Learnings */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-200 mb-2">
                        Key Learnings
                      </label>
                      <textarea
                        value={learnings}
                        onChange={(e) => setLearnings(e.target.value)}
                        rows={3}
                        className="mt-1 block w-full rounded-md border-0 bg-gray-700 py-1.5 text-white shadow-sm ring-1 ring-inset ring-gray-600 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                        placeholder="What did you learn today about your trading discipline?"
                      />
                    </div>

                    {/* Notes */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-200 mb-2">
                        Additional Notes
                      </label>
                      <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows={3}
                        className="mt-1 block w-full rounded-md border-0 bg-gray-700 py-1.5 text-white shadow-sm ring-1 ring-inset ring-gray-600 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                        placeholder="Any additional thoughts or observations..."
                      />
                    </div>
                  </div>

                  <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
                    <button
                      type="submit"
                      className="inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 sm:col-start-2"
                    >
                      Save Entry
                    </button>
                    <button
                      type="button"
                      className="mt-3 inline-flex w-full justify-center rounded-md bg-gray-700 px-3 py-2 text-sm font-semibold text-white shadow-sm ring-1 ring-inset ring-gray-600 hover:bg-gray-600 sm:col-start-1 sm:mt-0"
                      onClick={onClose}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}; 