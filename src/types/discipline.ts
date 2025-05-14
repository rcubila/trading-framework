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

export interface DisciplineStats {
  averageRating: number;
  totalEntries: number;
  mostBrokenRules: Array<{rule: string; count: number}>;
  mostFollowedRules: Array<{rule: string; count: number}>;
  weeklyTrend: Array<{week: string; averageRating: number}>;
  complianceRate: number;
} 