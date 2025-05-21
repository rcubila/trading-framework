export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          created_at: string
          email: string
          name: string | null
          avatar_url: string | null
          timezone: string | null
          risk_per_trade: number | null
          account_size: number | null
          updated_at: string | null
        }
        Insert: {
          id: string
          created_at?: string
          email: string
          name?: string | null
          avatar_url?: string | null
          timezone?: string | null
          risk_per_trade?: number | null
          account_size?: number | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          email?: string
          name?: string | null
          avatar_url?: string | null
          timezone?: string | null
          risk_per_trade?: number | null
          account_size?: number | null
          updated_at?: string | null
        }
      }
      strategies: {
        Row: {
          id: string
          created_at: string
          user_id: string
          name: string
          description: string | null
          type: string | null
          is_playbook: boolean
          parent_id: string | null
          asset_name: string | null
          performance_total_trades: number
          performance_win_rate: number
          performance_average_r: number
          performance_profit_factor: number
          performance_expectancy: number
          performance_largest_win: number
          performance_largest_loss: number
          performance_average_win: number
          performance_average_loss: number
          performance_net_pl: number
          updated_at: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          user_id: string
          name: string
          description?: string | null
          type?: string | null
          is_playbook?: boolean
          parent_id?: string | null
          asset_name?: string | null
          performance_total_trades?: number
          performance_win_rate?: number
          performance_average_r?: number
          performance_profit_factor?: number
          performance_expectancy?: number
          performance_largest_win?: number
          performance_largest_loss?: number
          performance_average_win?: number
          performance_average_loss?: number
          performance_net_pl?: number
          updated_at?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          user_id?: string
          name?: string
          description?: string | null
          type?: string | null
          is_playbook?: boolean
          parent_id?: string | null
          asset_name?: string | null
          performance_total_trades?: number
          performance_win_rate?: number
          performance_average_r?: number
          performance_profit_factor?: number
          performance_expectancy?: number
          performance_largest_win?: number
          performance_largest_loss?: number
          performance_average_win?: number
          performance_average_loss?: number
          performance_net_pl?: number
          updated_at?: string | null
        }
      }
      playbook_rules: {
        Row: {
          id: string
          strategy_id: string
          content: string
          order_index: number
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          strategy_id: string
          content: string
          order_index: number
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          strategy_id?: string
          content?: string
          order_index?: number
          created_at?: string
          updated_at?: string | null
        }
      }
      missed_trades: {
        Row: {
          id: string
          strategy_id: string
          date: string
          symbol: string
          reason: string | null
          potential_pnl: number | null
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          strategy_id: string
          date: string
          symbol: string
          reason?: string | null
          potential_pnl?: number | null
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          strategy_id?: string
          date?: string
          symbol?: string
          reason?: string | null
          potential_pnl?: number | null
          created_at?: string
          updated_at?: string | null
        }
      }
      // ... rest of existing tables ...
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
} 