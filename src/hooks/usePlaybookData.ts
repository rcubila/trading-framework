import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';

export interface PlaybookStrategy {
  id: string;
  title: string;
  description: string;
  type: string;
  tags: string[];
  notes: string;
  checklist: string[];
  trades: any[];
  icon?: string;
  performance: {
    totalTrades: number;
    winRate: number;
    averageR: number;
    profitFactor: number;
    expectancy: number;
    largestWin: number;
    largestLoss: number;
    averageWin: number;
    averageLoss: number;
    netPL: number;
  };
}

export interface PlaybookAsset {
  id: string;
  asset: string;
  description: string;
  icon?: string;
  strategies: PlaybookStrategy[];
  performance: {
    totalTrades: number;
    winRate: number;
    averageR: number;
    profitFactor: number;
    expectancy: number;
    netPL: number;
  };
}

interface UsePlaybookDataReturn {
  assets: PlaybookAsset[];
  isLoading: boolean;
  error: Error | null;
  refreshData: () => Promise<void>;
  createAsset: (asset: Omit<PlaybookAsset, 'id' | 'strategies' | 'performance'>) => Promise<void>;
  deleteAsset: (assetId: string) => Promise<void>;
  createStrategy: (assetId: string, strategy: Omit<PlaybookStrategy, 'id' | 'performance'>) => Promise<void>;
  deleteStrategy: (assetId: string, strategyId: string) => Promise<void>;
  updateStrategyIcon: (strategyId: string, icon: string) => Promise<void>;
}

export const usePlaybookData = (): UsePlaybookDataReturn => {
  const [assets, setAssets] = useState<PlaybookAsset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchStrategiesForAsset = useCallback(async (assetName: string): Promise<PlaybookStrategy[]> => {
    try {
      const { data: strategies, error } = await supabase
        .from('strategies')
        .select('*')
        .eq('asset_name', assetName)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return strategies.map(strategy => ({
        id: strategy.id,
        title: strategy.name,
        description: strategy.description || '',
        type: strategy.type || '',
        tags: strategy.rules || [],
        notes: '',
        checklist: [],
        trades: [],
        icon: strategy.icon || undefined,
        performance: {
          totalTrades: strategy.performance_total_trades || 0,
          winRate: strategy.performance_win_rate || 0,
          averageR: strategy.performance_average_r || 0,
          profitFactor: strategy.performance_profit_factor || 0,
          expectancy: strategy.performance_expectancy || 0,
          largestWin: strategy.performance_largest_win || 0,
          largestLoss: strategy.performance_largest_loss || 0,
          averageWin: strategy.performance_average_win || 0,
          averageLoss: strategy.performance_average_loss || 0,
          netPL: strategy.performance_net_pl || 0,
        },
      }));
    } catch (error) {
      console.error('Error fetching strategies:', error);
      return [];
    }
  }, []);

  const fetchAssets = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data: strategies, error } = await supabase
        .from('strategies')
        .select('asset_name')
        .not('asset_name', 'is', null)
        .order('asset_name');

      if (error) throw error;

      const uniqueAssets = [...new Set(strategies.map(s => s.asset_name))];
      const assetsData = await Promise.all(
        uniqueAssets.map(async (assetName) => {
          const strategies = await fetchStrategiesForAsset(assetName);
          return {
            id: assetName,
            asset: assetName,
            description: `${assetName} trading strategies`,
            strategies,
            performance: {
              totalTrades: strategies.reduce((sum, s) => sum + s.performance.totalTrades, 0),
              winRate: strategies.reduce((sum, s) => sum + s.performance.winRate, 0) / strategies.length || 0,
              averageR: strategies.reduce((sum, s) => sum + s.performance.averageR, 0) / strategies.length || 0,
              profitFactor: strategies.reduce((sum, s) => sum + s.performance.profitFactor, 0) / strategies.length || 0,
              expectancy: strategies.reduce((sum, s) => sum + s.performance.expectancy, 0) / strategies.length || 0,
              netPL: strategies.reduce((sum, s) => sum + s.performance.netPL, 0),
            },
          };
        })
      );

      setAssets(assetsData);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load assets';
      setError(new Error(errorMessage));
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [fetchStrategiesForAsset]);

  useEffect(() => {
    fetchAssets();
  }, [fetchAssets]);

  const createAsset = async (asset: Omit<PlaybookAsset, 'id' | 'strategies' | 'performance'>) => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) throw new Error('No user found');

      const { error } = await supabase
        .from('strategies')
        .insert({
          user_id: user.id,
          name: asset.asset,
          description: asset.description,
          asset_name: asset.asset,
          icon: asset.icon,
          rules: [],
          market_conditions: [],
          timeframes: [],
          is_playbook: true,
        });

      if (error) throw error;

      await fetchAssets();
      toast.success('Asset created successfully');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create asset';
      toast.error(errorMessage);
      throw error;
    }
  };

  const deleteAsset = async (assetId: string) => {
    try {
      const { error } = await supabase
        .from('strategies')
        .delete()
        .eq('asset_name', assetId);

      if (error) throw error;

      setAssets(prev => prev.filter(asset => asset.id !== assetId));
      toast.success('Asset deleted successfully');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete asset';
      toast.error(errorMessage);
      throw error;
    }
  };

  const createStrategy = async (assetId: string, strategy: Omit<PlaybookStrategy, 'id' | 'performance'>) => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) throw new Error('No user found');

      const { error } = await supabase
        .from('strategies')
        .insert({
          user_id: user.id,
          name: strategy.title,
          description: strategy.description,
          type: strategy.type,
          asset_name: assetId,
          rules: strategy.tags,
          icon: strategy.icon,
          is_playbook: false,
        });

      if (error) throw error;

      await fetchAssets();
      toast.success('Strategy created successfully');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create strategy';
      toast.error(errorMessage);
      throw error;
    }
  };

  const deleteStrategy = async (assetId: string, strategyId: string) => {
    try {
      const { error } = await supabase
        .from('strategies')
        .delete()
        .eq('id', strategyId);

      if (error) throw error;

      await fetchAssets();
      toast.success('Strategy deleted successfully');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete strategy';
      toast.error(errorMessage);
      throw error;
    }
  };

  const updateStrategyIcon = async (strategyId: string, icon: string) => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) throw new Error('No user found');

      const { error } = await supabase
        .from('strategies')
        .update({
          icon: icon,
        })
        .eq('id', strategyId);

      if (error) throw error;

      await fetchAssets();
      toast.success('Strategy icon updated successfully');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update strategy icon';
      toast.error(errorMessage);
      throw error;
    }
  };

  return {
    assets,
    isLoading,
    error,
    refreshData: fetchAssets,
    createAsset,
    deleteAsset,
    createStrategy,
    deleteStrategy,
    updateStrategyIcon,
  };
}; 