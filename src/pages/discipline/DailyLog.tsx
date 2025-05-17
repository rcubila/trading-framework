import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  RiCheckLine,
  RiEmotionLine,
  RiMoneyDollarCircleLine,
  RiFileTextLine,
  RiPercentLine,
  RiNumbersLine,
  RiInformationLine,
  RiErrorWarningLine,
} from 'react-icons/ri';
import { Popover } from '@headlessui/react';

export interface DailyCheckInData {
  followedPlan: boolean;
  tradeCount: number;
  planAdherencePercent: number;
  profitLoss: number;
  isProfitLossPercentage: boolean;
  emotionalStates: string[];
  notes: string;
  date: string;
}

const emotionalStates = [
  { emoji: '😌', label: 'Calm', value: 'Calm', description: 'Feeling balanced and composed' },
  { emoji: '😰', label: 'Anxious', value: 'Anxious', description: 'Feeling worried or uneasy' },
  { emoji: '🤑', label: 'Greedy', value: 'Greedy', description: 'Wanting more than necessary' },
  { emoji: '😎', label: 'Confident', value: 'Confident', description: 'Feeling sure about decisions' },
  { emoji: '😤', label: 'Frustrated', value: 'Frustrated', description: 'Feeling annoyed or upset' },
  { emoji: '🎯', label: 'Focused', value: 'Focused', description: 'Highly concentrated and attentive' },
  { emoji: '😴', label: 'Tired', value: 'Tired', description: 'Low energy or exhausted' },
  { emoji: '😐', label: 'Neutral', value: 'Neutral', description: 'Neither positive nor negative' },
  { emoji: '🤔', label: 'Analytical', value: 'Analytical', description: 'Thinking deeply about trades' },
  { emoji: '😊', label: 'Satisfied', value: 'Satisfied', description: 'Content with performance' }
];

interface DailyLogProps {
  onSubmit: (data: DailyCheckInData) => void;
}

interface ValidationErrors {
  tradeCount?: string;
  planAdherencePercent?: string;
  emotionalStates?: string;
  profitLoss?: string;
}

const formAnimation = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut"
    }
  }
};

export const DailyLog: React.FC<DailyLogProps> = ({ onSubmit }) => {
  const [formData, setFormData] = useState<DailyCheckInData>({
    followedPlan: false,
    tradeCount: 0,
    planAdherencePercent: 0,
    profitLoss: 0,
    isProfitLossPercentage: false,
    emotionalStates: [],
    notes: '',
    date: new Date().toISOString().split('T')[0]
  });

  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Validate form and set errors
    const errors: ValidationErrors = {};
    
    if (formData.tradeCount < 0) {
      errors.tradeCount = 'Number of trades cannot be negative';
    }
    
    if (formData.planAdherencePercent < 0 || formData.planAdherencePercent > 100) {
      errors.planAdherencePercent = 'Plan adherence must be between 0 and 100';
    }
    
    if (formData.emotionalStates.length === 0) {
      errors.emotionalStates = 'Please select at least one emotion';
    }

    setValidationErrors(errors);
    
    // Check overall form validity
    const isValid = 
      formData.tradeCount >= 0 &&
      formData.planAdherencePercent >= 0 &&
      formData.planAdherencePercent <= 100 &&
      formData.emotionalStates.length > 0;
    
    setIsFormValid(isValid);
    setHasUnsavedChanges(true);
  }, [formData]);

  // Handle browser close/navigation with enhanced warning
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        const message = 'You have unsaved changes. Are you sure you want to leave?';
        e.preventDefault();
        e.returnValue = message;
        return message;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isFormValid) {
      toast.error('Please fix the validation errors before submitting', {
        duration: 3000,
        icon: '⚠️'
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Animate the form submission
      const formElement = e.currentTarget as HTMLFormElement;
      formElement.style.transform = 'scale(0.98)';
      setTimeout(() => {
        formElement.style.transform = 'scale(1)';
      }, 100);

      await onSubmit(formData);
      
      toast.success('Daily check-in submitted successfully! 📝', {
        duration: 3000,
        icon: '✅'
      });
      
      setFormData({
        followedPlan: false,
        tradeCount: 0,
        planAdherencePercent: 0,
        profitLoss: 0,
        isProfitLossPercentage: false,
        emotionalStates: [],
        notes: '',
        date: new Date().toISOString().split('T')[0]
      });
      setHasUnsavedChanges(false);
    } catch (error) {
      toast.error('Failed to submit check-in. Please try again.', {
        duration: 3000,
        icon: '❌'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleEmotionalState = (state: string) => {
    setFormData(prev => {
      const states = prev.emotionalStates.includes(state)
        ? prev.emotionalStates.filter(s => s !== state)
        : [...prev.emotionalStates, state];
      return { ...prev, emotionalStates: states };
    });
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={formAnimation}
      className="bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-lg"
    >
      <motion.h2 
        className="text-xl font-semibold text-white mb-6 flex items-center gap-2"
        initial={{ x: -20 }}
        animate={{ x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <RiCheckLine className="text-indigo-400" />
        Daily Trading Log
        {hasUnsavedChanges && (
          <span className="text-xs text-yellow-400 font-normal ml-2">
            (Unsaved changes)
          </span>
        )}
      </motion.h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Date Selection */}
        <motion.div whileHover={{ scale: 1.01 }}>
          <label className="block text-sm font-medium text-gray-300 mb-2">Date</label>
          <input
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            className="w-full bg-gray-700 border border-gray-600 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            max={new Date().toISOString().split('T')[0]}
          />
        </motion.div>

        {/* Trading Plan Adherence */}
        <motion.div whileHover={{ scale: 1.01 }}>
          <div className="flex items-center gap-2 mb-2">
            <label className="text-sm font-medium text-gray-300">
              Did you follow your trading plan today?
            </label>
            <Popover className="relative">
              <Popover.Button className="text-gray-400 hover:text-gray-300">
                <RiInformationLine />
              </Popover.Button>
              <Popover.Panel className="absolute z-10 bg-gray-700 p-2 rounded-md text-xs text-gray-300 w-48 mt-1">
                Did you fully follow your written trading plan today without any deviation?
              </Popover.Panel>
            </Popover>
          </div>
          <div className="flex gap-4">
            <motion.button
              type="button"
              onClick={() => setFormData({ ...formData, followedPlan: true })}
              className={`flex-1 px-4 py-2 rounded-md transition-all duration-200 ${
                formData.followedPlan
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-700 text-gray-300'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Yes ✅
            </motion.button>
            <motion.button
              type="button"
              onClick={() => setFormData({ ...formData, followedPlan: false })}
              className={`flex-1 px-4 py-2 rounded-md transition-all duration-200 ${
                !formData.followedPlan
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-700 text-gray-300'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              No ❌
            </motion.button>
          </div>
        </motion.div>

        {/* Number of Trades with validation */}
        <motion.div whileHover={{ scale: 1.01 }}>
          <div className="flex items-center gap-2 mb-2">
            <label className="text-sm font-medium text-gray-300">
              <RiNumbersLine className="inline mr-2 text-indigo-400" />
              Number of trades taken today
            </label>
            <Popover className="relative">
              <Popover.Button className="text-gray-400 hover:text-gray-300">
                <RiInformationLine />
              </Popover.Button>
              <Popover.Panel className="absolute z-10 bg-gray-700 p-2 rounded-md text-xs text-gray-300 w-48 mt-1">
                Enter the total number of trades executed today
              </Popover.Panel>
            </Popover>
          </div>
          <input
            type="number"
            min="0"
            value={formData.tradeCount}
            onChange={(e) => setFormData({ ...formData, tradeCount: Math.max(0, parseInt(e.target.value) || 0) })}
            className={`w-full bg-gray-700 border rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
              validationErrors.tradeCount ? 'border-red-500' : 'border-gray-600'
            }`}
            placeholder="Enter number of trades"
          />
          {validationErrors.tradeCount && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-sm text-red-400 mt-1"
            >
              {validationErrors.tradeCount}
            </motion.p>
          )}
        </motion.div>

        {/* Plan Adherence Percentage with validation */}
        <motion.div whileHover={{ scale: 1.01 }}>
          <div className="flex items-center gap-2 mb-2">
            <label className="text-sm font-medium text-gray-300">
              <RiPercentLine className="inline mr-2 text-indigo-400" />
              % of trades that followed your plan
            </label>
            <Popover className="relative">
              <Popover.Button className="text-gray-400 hover:text-gray-300">
                <RiInformationLine />
              </Popover.Button>
              <Popover.Panel className="absolute z-10 bg-gray-700 p-2 rounded-md text-xs text-gray-300 w-48 mt-1">
                Out of your total trades today, what percentage strictly followed your trading plan?
              </Popover.Panel>
            </Popover>
          </div>
          <input
            type="number"
            min="0"
            max="100"
            value={formData.planAdherencePercent}
            onChange={(e) => setFormData({ ...formData, planAdherencePercent: Math.min(100, Math.max(0, parseInt(e.target.value) || 0)) })}
            className={`w-full bg-gray-700 border rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
              validationErrors.planAdherencePercent ? 'border-red-500' : 'border-gray-600'
            }`}
            placeholder="Enter percentage"
          />
          {validationErrors.planAdherencePercent && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-sm text-red-400 mt-1"
            >
              {validationErrors.planAdherencePercent}
            </motion.p>
          )}
        </motion.div>

        {/* Profit/Loss */}
        <motion.div whileHover={{ scale: 1.01 }}>
          <div className="flex items-center gap-2 mb-2">
            <label className="text-sm font-medium text-gray-300">
              <RiMoneyDollarCircleLine className="inline mr-2 text-indigo-400" />
              Profit/Loss
            </label>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="relative">
                <span className="absolute left-3 top-2 text-gray-400">
                  {formData.isProfitLossPercentage ? '%' : '$'}
                </span>
                <input
                  type="number"
                  step="0.01"
                  value={formData.profitLoss}
                  onChange={(e) => setFormData({ ...formData, profitLoss: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-gray-700 border border-gray-600 rounded-md pl-8 pr-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder={formData.isProfitLossPercentage ? "10.5" : "100.50"}
                />
              </div>
            </div>
            <div className="flex rounded-md overflow-hidden">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, isProfitLossPercentage: false })}
                className={`px-4 py-2 ${!formData.isProfitLossPercentage ? 'bg-indigo-600 text-white' : 'bg-gray-700 text-gray-300'}`}
              >
                $
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, isProfitLossPercentage: true })}
                className={`px-4 py-2 ${formData.isProfitLossPercentage ? 'bg-indigo-600 text-white' : 'bg-gray-700 text-gray-300'}`}
              >
                %
              </button>
            </div>
          </div>
        </motion.div>

        {/* Emotional States Selection */}
        <motion.div whileHover={{ scale: 1.01 }} className="space-y-2">
          <div className="flex items-center gap-2 mb-2">
            <label className="text-sm font-medium text-gray-300">
              <RiEmotionLine className="inline mr-2 text-indigo-400" />
              How are you feeling today?
            </label>
            <Popover className="relative">
              <Popover.Button className="text-gray-400 hover:text-gray-300">
                <RiInformationLine />
              </Popover.Button>
              <Popover.Panel className="absolute z-10 bg-gray-700 p-2 rounded-md text-xs text-gray-300 w-48 mt-1">
                Select one or more emotions that describe your trading mindset today
              </Popover.Panel>
            </Popover>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
            {emotionalStates.map((state) => (
              <motion.button
                key={state.value}
                type="button"
                onClick={() => toggleEmotionalState(state.value)}
                className={`flex items-center gap-2 p-2 rounded-lg transition-all duration-200 ${
                  formData.emotionalStates.includes(state.value)
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="text-xl">{state.emoji}</span>
                <span className="text-sm">{state.label}</span>
              </motion.button>
            ))}
          </div>
          {formData.emotionalStates.length === 0 && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-sm text-red-400 mt-1"
            >
              Please select at least one emotion
            </motion.p>
          )}
        </motion.div>

        {/* Notes */}
        <motion.div whileHover={{ scale: 1.01 }}>
          <div className="flex items-center gap-2 mb-2">
            <label className="text-sm font-medium text-gray-300">
              <RiFileTextLine className="inline mr-2 text-indigo-400" />
              Trading Journal Notes (optional)
            </label>
          </div>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            rows={4}
            className="w-full bg-gray-700 border border-gray-600 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="What worked today? What didn't? How did you feel during specific trades? Any patterns or insights?"
          />
        </motion.div>

        {/* Submit Button */}
        <motion.button
          type="submit"
          disabled={!isFormValid || isSubmitting}
          className={`w-full px-4 py-2 rounded-md text-white font-medium transition-all duration-200 ${
            isFormValid && !isSubmitting
              ? 'bg-indigo-600 hover:bg-indigo-700'
              : 'bg-gray-600 cursor-not-allowed'
          }`}
          whileHover={isFormValid && !isSubmitting ? { scale: 1.02 } : {}}
          whileTap={isFormValid && !isSubmitting ? { scale: 0.98 } : {}}
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center gap-2">
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                ⚡
              </motion.span>
              Submitting...
            </span>
          ) : (
            'Submit Daily Check-in'
          )}
        </motion.button>
      </form>
    </motion.div>
  );
}; 