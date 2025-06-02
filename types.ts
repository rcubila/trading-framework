export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      daily_checkins: {
        Row: {
          created_at: string
          date: string
          emotional_state: string
          followed_plan: boolean
          id: string
          notes: string | null
          plan_adherence_percent: number
          profit_loss: number
          trade_count: number
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          date: string
          emotional_state: string
          followed_plan: boolean
          id?: string
          notes?: string | null
          plan_adherence_percent: number
          profit_loss: number
          trade_count: number
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          date?: string
          emotional_state?: string
          followed_plan?: boolean
          id?: string
          notes?: string | null
          plan_adherence_percent?: number
          profit_loss?: number
          trade_count?: number
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      daily_logs: {
        Row: {
          created_at: string
          date: string
          emotional_state: string
          followed_plan: boolean
          id: string
          is_profit_loss_percentage: boolean
          notes: string | null
          plan_adherence_percent: number
          profit_loss: number
          trade_count: number
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          date: string
          emotional_state: string
          followed_plan: boolean
          id?: string
          is_profit_loss_percentage?: boolean
          notes?: string | null
          plan_adherence_percent: number
          profit_loss: number
          trade_count: number
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          date?: string
          emotional_state?: string
          followed_plan?: boolean
          id?: string
          is_profit_loss_percentage?: boolean
          notes?: string | null
          plan_adherence_percent?: number
          profit_loss?: number
          trade_count?: number
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      discipline_tracker: {
        Row: {
          created_at: string | null
          date: string
          id: string
          notes: string | null
          rating: number | null
          rules_broken: string[] | null
          rules_followed: string[] | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          date: string
          id?: string
          notes?: string | null
          rating?: number | null
          rules_broken?: string[] | null
          rules_followed?: string[] | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          date?: string
          id?: string
          notes?: string | null
          rating?: number | null
          rules_broken?: string[] | null
          rules_followed?: string[] | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      journal_entries: {
        Row: {
          created_at: string | null
          emotions: string[] | null
          entry_date: string | null
          id: string
          images: string[] | null
          improvements: string[] | null
          lessons_learned: string[] | null
          market_conditions: string[] | null
          mistakes: string[] | null
          notes: string | null
          rating: number | null
          trade_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          emotions?: string[] | null
          entry_date?: string | null
          id?: string
          images?: string[] | null
          improvements?: string[] | null
          lessons_learned?: string[] | null
          market_conditions?: string[] | null
          mistakes?: string[] | null
          notes?: string | null
          rating?: number | null
          trade_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          emotions?: string[] | null
          entry_date?: string | null
          id?: string
          images?: string[] | null
          improvements?: string[] | null
          lessons_learned?: string[] | null
          market_conditions?: string[] | null
          mistakes?: string[] | null
          notes?: string | null
          rating?: number | null
          trade_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "journal_entries_trade_id_fkey"
            columns: ["trade_id"]
            isOneToOne: false
            referencedRelation: "trades"
            referencedColumns: ["id"]
          },
        ]
      }
      missed_trades: {
        Row: {
          created_at: string | null
          date: string
          id: string
          potential_pnl: number | null
          reason: string | null
          strategy_id: string | null
          symbol: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          date: string
          id?: string
          potential_pnl?: number | null
          reason?: string | null
          strategy_id?: string | null
          symbol: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          date?: string
          id?: string
          potential_pnl?: number | null
          reason?: string | null
          strategy_id?: string | null
          symbol?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "missed_trades_strategy_id_fkey"
            columns: ["strategy_id"]
            isOneToOne: false
            referencedRelation: "strategies"
            referencedColumns: ["id"]
          },
        ]
      }
      performance_metrics: {
        Row: {
          average_loss: number | null
          average_win: number | null
          created_at: string | null
          date: string
          id: string
          largest_loss: number | null
          largest_win: number | null
          losing_trades: number | null
          market_category: Database["public"]["Enums"]["market_category"] | null
          net_profit: number | null
          profit_factor: number | null
          timeframe: string | null
          total_trades: number | null
          updated_at: string | null
          user_id: string
          win_rate: number | null
          winning_trades: number | null
        }
        Insert: {
          average_loss?: number | null
          average_win?: number | null
          created_at?: string | null
          date: string
          id?: string
          largest_loss?: number | null
          largest_win?: number | null
          losing_trades?: number | null
          market_category?:
            | Database["public"]["Enums"]["market_category"]
            | null
          net_profit?: number | null
          profit_factor?: number | null
          timeframe?: string | null
          total_trades?: number | null
          updated_at?: string | null
          user_id: string
          win_rate?: number | null
          winning_trades?: number | null
        }
        Update: {
          average_loss?: number | null
          average_win?: number | null
          created_at?: string | null
          date?: string
          id?: string
          largest_loss?: number | null
          largest_win?: number | null
          losing_trades?: number | null
          market_category?:
            | Database["public"]["Enums"]["market_category"]
            | null
          net_profit?: number | null
          profit_factor?: number | null
          timeframe?: string | null
          total_trades?: number | null
          updated_at?: string | null
          user_id?: string
          win_rate?: number | null
          winning_trades?: number | null
        }
        Relationships: []
      }
      playbook_rules: {
        Row: {
          content: string
          created_at: string | null
          id: string
          order_index: number
          strategy_id: string | null
          updated_at: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          order_index: number
          strategy_id?: string | null
          updated_at?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          order_index?: number
          strategy_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "playbook_rules_strategy_id_fkey"
            columns: ["strategy_id"]
            isOneToOne: false
            referencedRelation: "strategies"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          role: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          role?: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          role?: string
          updated_at?: string
        }
        Relationships: []
      }
      strategies: {
        Row: {
          asset_name: string | null
          created_at: string | null
          description: string | null
          id: string
          is_playbook: boolean | null
          market_conditions: string[] | null
          name: string
          parent_id: string | null
          performance_average_loss: number | null
          performance_average_r: number | null
          performance_average_win: number | null
          performance_expectancy: number | null
          performance_largest_loss: number | null
          performance_largest_win: number | null
          performance_net_pl: number | null
          performance_profit_factor: number | null
          performance_total_trades: number | null
          performance_win_rate: number | null
          reward_ratio: number | null
          risk_percentage: number | null
          rules: string[] | null
          timeframes: string[] | null
          type: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          asset_name?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_playbook?: boolean | null
          market_conditions?: string[] | null
          name: string
          parent_id?: string | null
          performance_average_loss?: number | null
          performance_average_r?: number | null
          performance_average_win?: number | null
          performance_expectancy?: number | null
          performance_largest_loss?: number | null
          performance_largest_win?: number | null
          performance_net_pl?: number | null
          performance_profit_factor?: number | null
          performance_total_trades?: number | null
          performance_win_rate?: number | null
          reward_ratio?: number | null
          risk_percentage?: number | null
          rules?: string[] | null
          timeframes?: string[] | null
          type?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          asset_name?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_playbook?: boolean | null
          market_conditions?: string[] | null
          name?: string
          parent_id?: string | null
          performance_average_loss?: number | null
          performance_average_r?: number | null
          performance_average_win?: number | null
          performance_expectancy?: number | null
          performance_largest_loss?: number | null
          performance_largest_win?: number | null
          performance_net_pl?: number | null
          performance_profit_factor?: number | null
          performance_total_trades?: number | null
          performance_win_rate?: number | null
          reward_ratio?: number | null
          risk_percentage?: number | null
          rules?: string[] | null
          timeframes?: string[] | null
          type?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "strategies_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "strategies"
            referencedColumns: ["id"]
          },
        ]
      }
      tags: {
        Row: {
          color: string | null
          created_at: string | null
          id: string
          name: string
          user_id: string
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          id?: string
          name: string
          user_id: string
        }
        Update: {
          color?: string | null
          created_at?: string | null
          id?: string
          name?: string
          user_id?: string
        }
        Relationships: []
      }
      trades: {
        Row: {
          created_at: string
          deleted_at: string | null
          entry_date: string
          entry_price: number
          exit_date: string | null
          exit_price: number | null
          id: string
          market: string
          market_category: Database["public"]["Enums"]["market_category"]
          notes: string | null
          pnl: number | null
          pnl_percentage: number | null
          quantity: number
          reward: number | null
          risk: number | null
          risk_reward: number | null
          status: Database["public"]["Enums"]["trade_status"]
          strategy: string | null
          symbol: string
          tags: string[] | null
          type: Database["public"]["Enums"]["trade_type"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          entry_date: string
          entry_price: number
          exit_date?: string | null
          exit_price?: number | null
          id?: string
          market: string
          market_category: Database["public"]["Enums"]["market_category"]
          notes?: string | null
          pnl?: number | null
          pnl_percentage?: number | null
          quantity: number
          reward?: number | null
          risk?: number | null
          risk_reward?: number | null
          status: Database["public"]["Enums"]["trade_status"]
          strategy?: string | null
          symbol: string
          tags?: string[] | null
          type: Database["public"]["Enums"]["trade_type"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          entry_date?: string
          entry_price?: number
          exit_date?: string | null
          exit_price?: number | null
          id?: string
          market?: string
          market_category?: Database["public"]["Enums"]["market_category"]
          notes?: string | null
          pnl?: number | null
          pnl_percentage?: number | null
          quantity?: number
          reward?: number | null
          risk?: number | null
          risk_reward?: number | null
          status?: Database["public"]["Enums"]["trade_status"]
          strategy?: string | null
          symbol?: string
          tags?: string[] | null
          type?: Database["public"]["Enums"]["trade_type"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "trades_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      trading_habits: {
        Row: {
          created_at: string
          daily_status: Json | null
          done: number | null
          goal: number
          icon: string
          id: string
          name: string
          progress: number | null
          remaining: number
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          daily_status?: Json | null
          done?: number | null
          goal: number
          icon: string
          id?: string
          name: string
          progress?: number | null
          remaining: number
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          daily_status?: Json | null
          done?: number | null
          goal?: number
          icon?: string
          id?: string
          name?: string
          progress?: number | null
          remaining?: number
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      trading_rules: {
        Row: {
          category: string
          created_at: string | null
          description: string
          id: string
          importance: string
          name: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          category: string
          created_at?: string | null
          description: string
          id?: string
          importance: string
          name: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string
          id?: string
          importance?: string
          name?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      handle_profile_creation: {
        Args: {
          p_user_id: string
          p_email: string
          p_full_name?: string
          p_avatar_url?: string
        }
        Returns: undefined
      }
    }
    Enums: {
      market_category: "Equities" | "Crypto" | "Forex" | "Futures" | "Other"
      trade_status: "Open" | "Closed"
      trade_type: "Long" | "Short"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      market_category: ["Equities", "Crypto", "Forex", "Futures", "Other"],
      trade_status: ["Open", "Closed"],
      trade_type: ["Long", "Short"],
    },
  },
} as const
