import { useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import type { TradingRule, DisciplineEntry } from '../types/discipline.js';
import { supabase } from '../lib/supabaseClient.js';
import { toast } from 'react-hot-toast';

interface AddEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEntryAdded: () => void;
}

export default function AddEntryModal({ isOpen, onClose, onEntryAdded }: AddEntryModalProps) {
  const [rules, setRules] = useState<TradingRule[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<DisciplineEntry>>({
    date: new Date().toISOString().split('T')[0],
    rules_followed: [],
    rules_broken: [],
    notes: '',
    rating: 5,
  });

  useEffect(() => {
    fetchRules();
  }, []);

  const fetchRules = async () => {
    try {
      const { data, error } = await supabase
        .from('trading_rules')
        .select('*')
        .order('category', { ascending: true });

      if (error) throw error;
      setRules(data || []);
    } catch (error) {
      console.error('Error fetching rules:', error);
      toast.error('Failed to load trading rules');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('No user found');

      const entry = {
        ...formData,
        user_id: userData.user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('discipline_tracker')
        .insert([entry]);

      if (error) throw error;

      toast.success('Entry added successfully');
      onEntryAdded();
      onClose();
      setFormData({
        date: new Date().toISOString().split('T')[0],
        rules_followed: [],
        rules_broken: [],
        notes: '',
        rating: 5,
      });
    } catch (error) {
      console.error('Error adding entry:', error);
      toast.error('Failed to add entry');
    } finally {
      setLoading(false);
    }
  };

  const handleRuleToggle = (ruleId: string, type: 'followed' | 'broken') => {
    const field = type === 'followed' ? 'rules_followed' : 'rules_broken';
    const otherField = type === 'followed' ? 'rules_broken' : 'rules_followed';
    
    setFormData(prev => {
      const currentArray = [...(prev[field] || [])];
      const otherArray = [...(prev[otherField] || [])];
      
      const index = currentArray.indexOf(ruleId);
      if (index === -1) {
        // Add to current array and remove from other array if present
        return {
          ...prev,
          [field]: [...currentArray, ruleId],
          [otherField]: otherArray.filter(id => id !== ruleId)
        };
      } else {
        // Remove from current array
        return {
          ...prev,
          [field]: currentArray.filter(id => id !== ruleId)
        };
      }
    });
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
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
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                  Add Daily Discipline Entry
                </Dialog.Title>

                <form onSubmit={handleSubmit} className="mt-4 space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Date</label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Rules Followed</label>
                    <div className="mt-2 grid grid-cols-1 gap-2">
                      {rules.map((rule) => (
                        <div key={rule.id} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={formData.rules_followed?.includes(rule.id)}
                            onChange={() => handleRuleToggle(rule.id, 'followed')}
                            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                          />
                          <label className="ml-2 text-sm text-gray-700">
                            {rule.name} ({rule.category})
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Rules Broken</label>
                    <div className="mt-2 grid grid-cols-1 gap-2">
                      {rules.map((rule) => (
                        <div key={rule.id} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={formData.rules_broken?.includes(rule.id)}
                            onChange={() => handleRuleToggle(rule.id, 'broken')}
                            className="h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
                          />
                          <label className="ml-2 text-sm text-gray-700">
                            {rule.name} ({rule.category})
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Daily Rating (1-10)</label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={formData.rating}
                      onChange={(e) => setFormData({ ...formData, rating: parseInt(e.target.value) })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Notes</label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      rows={4}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      placeholder="Add any observations or lessons learned..."
                    />
                  </div>

                  <div className="mt-6 flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={onClose}
                      className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                      {loading ? 'Saving...' : 'Save Entry'}
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
} 