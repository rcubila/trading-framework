import React, { useState } from 'react';
import { CheckCircle, AlertCircle, BarChart2, Calendar, Clock, TrendingUp, TrendingDown } from 'lucide-react';
import styles from './DailyCheckIn.module.css';

interface DailyCheckInProps {
  onCheckIn: (data: any) => void;
}

const DailyCheckIn: React.FC<DailyCheckInProps> = ({ onCheckIn }) => {
  const [formData, setFormData] = useState({
    mood: '',
    energy: '',
    focus: '',
    sleep: '',
    exercise: '',
    meditation: '',
    notes: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCheckIn(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className={styles.container}>
      <div className={styles.grid}>
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <Calendar size={20} />
            Daily Check-in
          </h2>
          <p className={styles.sectionSubtitle}>
            Track your daily metrics and progress
          </p>
          <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Mood</label>
              <select
                name="mood"
                value={formData.mood}
                onChange={handleChange}
                className={styles.select}
                required
              >
                <option value="">Select mood</option>
                <option value="great">Great</option>
                <option value="good">Good</option>
                <option value="neutral">Neutral</option>
                <option value="bad">Bad</option>
                <option value="terrible">Terrible</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Energy Level</label>
              <select
                name="energy"
                value={formData.energy}
                onChange={handleChange}
                className={styles.select}
                required
              >
                <option value="">Select energy level</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Focus Level</label>
              <select
                name="focus"
                value={formData.focus}
                onChange={handleChange}
                className={styles.select}
                required
              >
                <option value="">Select focus level</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Sleep Hours</label>
              <input
                type="number"
                name="sleep"
                value={formData.sleep}
                onChange={handleChange}
                className={styles.input}
                min="0"
                max="24"
                step="0.5"
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Activities</label>
              <div className={styles.checkboxGroup}>
                <label className={styles.checkbox}>
                  <input
                    type="checkbox"
                    name="exercise"
                    checked={formData.exercise === 'true'}
                    onChange={(e) => handleChange({
                      target: { name: 'exercise', value: e.target.checked.toString() }
                    } as any)}
                  />
                  <span>Exercise</span>
                </label>
                <label className={styles.checkbox}>
                  <input
                    type="checkbox"
                    name="meditation"
                    checked={formData.meditation === 'true'}
                    onChange={(e) => handleChange({
                      target: { name: 'meditation', value: e.target.checked.toString() }
                    } as any)}
                  />
                  <span>Meditation</span>
                </label>
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Notes</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                className={styles.input}
                rows={4}
                placeholder="Add any additional notes..."
              />
            </div>

            <button type="submit" className={styles.submitButton}>
              <CheckCircle size={16} />
              Submit Check-in
            </button>
          </form>
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <BarChart2 size={20} />
            Progress Overview
          </h2>
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statTitle}>Weekly Average</div>
              <div className={`${styles.statValue} ${styles.statValuePositive}`}>
                <TrendingUp size={20} />
                85%
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statTitle}>Completion Rate</div>
              <div className={`${styles.statValue} ${styles.statValuePositive}`}>
                <CheckCircle size={20} />
                92%
              </div>
            </div>
          </div>

          <div className={styles.chartContainer}>
            <h3 className={styles.chartTitle}>Weekly Progress</h3>
            {/* Add your chart component here */}
          </div>

          <div className={styles.recentCheckIns}>
            <h3 className={styles.chartTitle}>Recent Check-ins</h3>
            <div className={styles.checkInCard}>
              <div className={styles.checkInHeader}>
                <div className={styles.checkInDate}>Today</div>
                <div className={`${styles.checkInStatus} ${styles.statusSuccess}`}>
                  <CheckCircle size={14} />
                  Completed
                </div>
              </div>
              <div className={styles.checkInDetails}>
                <div className={styles.detailItem}>
                  <div className={styles.detailLabel}>Mood</div>
                  <div className={styles.detailValue}>Great</div>
                </div>
                <div className={styles.detailItem}>
                  <div className={styles.detailLabel}>Energy</div>
                  <div className={styles.detailValue}>High</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DailyCheckIn; 