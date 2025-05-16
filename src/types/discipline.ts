export interface TradingRule {
  id: string;
  name: string;
  category: 'Entry' | 'Exit' | 'Risk Management' | 'Psychology' | 'Process';
  description: string;
  importance: 'Critical' | 'Important' | 'Good Practice';
  created_at?: string;
  updated_at?: string;
}

export interface DisciplineEntry {
  id: string;
  user_id: string;
  date: string;
  rules_followed: string[];
  rules_broken: string[];
  notes: string;
  rating: number;
  created_at?: string;
  updated_at?: string;
}

export interface DailyEntry {
  id: string;
  date: string;
  rating: number;
  rulesFollowed: string[];
  rulesBroken: string[];
  notes?: string;
  mood: string;
  learnings: string;
}

export interface Goal {
  id: string;
  title: string;
  description: string;
  targetDate: string;
  progress: number;
  status: 'not_started' | 'in_progress' | 'completed';
  metrics: {
    key: string;
    value: number;
    target: number;
  }[];
}

export interface DisciplineStats {
  averageRating: number;
  complianceRate: number;
  totalEntries: number;
  mostFollowedRules: Array<{ rule: string; count: number }>;
  mostBrokenRules: Array<{ rule: string; count: number }>;
  weeklyTrend: Array<{ week: string; averageRating: number }>;
  moodDistribution: Record<string, number>;
} 