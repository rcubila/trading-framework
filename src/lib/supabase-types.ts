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
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
          subscription_tier: string
          subscription_status: string
          subscription_end_date: string | null
          preferences: Json
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
          subscription_tier?: string
          subscription_status?: string
          subscription_end_date?: string | null
          preferences?: Json
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
          subscription_tier?: string
          subscription_status?: string
          subscription_end_date?: string | null
          preferences?: Json
        }
      }
      trades: {
        Row: {
          id: string
          user_id: string
          market: string
          market_category: 'Equities' | 'Crypto' | 'Forex' | 'Futures' | 'Other'
          symbol: string
          type: 'Long' | 'Short'
          status: 'Open' | 'Closed'
          entry_price: number
          exit_price: number | null
          quantity: number
          entry_date: string
          exit_date: string | null
          pnl: number | null
          pnl_percentage: number | null
          risk: number | null
          reward: number | null
          risk_reward: number | null
          strategy: string | null
          tags: string[] | null
          notes: string | null
          leverage: number | null
          stop_loss: number | null
          take_profit: number | null
          commission: number | null
          fees: number | null
          slippage: number | null
          exchange: string | null
          timeframe: string | null
          setup_type: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          market: string
          market_category: 'Equities' | 'Crypto' | 'Forex' | 'Futures' | 'Other'
          symbol: string
          type: 'Long' | 'Short'
          status?: 'Open' | 'Closed'
          entry_price: number
          exit_price?: number | null
          quantity: number
          entry_date: string
          exit_date?: string | null
          pnl?: number | null
          pnl_percentage?: number | null
          risk?: number | null
          reward?: number | null
          risk_reward?: number | null
          strategy?: string | null
          tags?: string[] | null
          notes?: string | null
          leverage?: number | null
          stop_loss?: number | null
          take_profit?: number | null
          commission?: number | null
          fees?: number | null
          slippage?: number | null
          exchange?: string | null
          timeframe?: string | null
          setup_type?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          market?: string
          market_category?: 'Equities' | 'Crypto' | 'Forex' | 'Futures' | 'Other'
          symbol?: string
          type?: 'Long' | 'Short'
          status?: 'Open' | 'Closed'
          entry_price?: number
          exit_price?: number | null
          quantity?: number
          entry_date?: string
          exit_date?: string | null
          pnl?: number | null
          pnl_percentage?: number | null
          risk?: number | null
          reward?: number | null
          risk_reward?: number | null
          strategy?: string | null
          tags?: string[] | null
          notes?: string | null
          leverage?: number | null
          stop_loss?: number | null
          take_profit?: number | null
          commission?: number | null
          fees?: number | null
          slippage?: number | null
          exchange?: string | null
          timeframe?: string | null
          setup_type?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      // Add other table types as needed...
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      market_category: 'Equities' | 'Crypto' | 'Forex' | 'Futures' | 'Other'
      trade_status: 'Open' | 'Closed'
      trade_type: 'Long' | 'Short'
    }
  }
} 