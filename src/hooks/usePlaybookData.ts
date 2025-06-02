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
  updateStrategyRules: (strategyId: string, rules: string[]) => Promise<void>;
  updateStrategyPerformance: (strategyId: string, performance: {
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
  }) => Promise<void>;
  addMissedTrade: (assetId: string, trade: any) => Promise<void>;
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
    console.log('createAsset started with:', asset);
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      console.log('Auth check result:', { user, userError });
      
      if (userError) throw userError;
      if (!user) throw new Error('No user found');

      // Check if asset already exists
      console.log('Checking for existing asset:', asset.asset);
      const { data: existingAsset, error: checkError } = await supabase
        .from('strategies')
        .select('id')
        .eq('asset_name', asset.asset)
        .eq('is_playbook', true)
        .single();

      console.log('Existing asset check result:', { existingAsset, checkError });

      if (checkError && checkError.code !== 'PGRST116') throw checkError;
      if (existingAsset) throw new Error('An asset with this name already exists');

      // Create the asset
      console.log('Creating new asset in database');
      const { data: newAsset, error: insertError } = await supabase
        .from('strategies')
        .insert({
          user_id: user.id,
          name: asset.asset,
          description: asset.description,
          asset_name: asset.asset,
          rules: [],
          market_conditions: [],
          timeframes: [],
          is_playbook: true,
          performance_total_trades: 0,
          performance_win_rate: 0,
          performance_average_r: 0,
          performance_profit_factor: 0,
          performance_expectancy: 0,
          performance_largest_win: 0,
          performance_largest_loss: 0,
          performance_average_win: 0,
          performance_average_loss: 0,
          performance_net_pl: 0
        })
        .select()
        .single();

      console.log('Insert result:', { newAsset, insertError });

      if (insertError) throw insertError;
      if (!newAsset) throw new Error('Failed to create asset');

      // Refresh the data
      console.log('Refreshing assets data');
      await fetchAssets();
      console.log('Asset creation completed successfully');
      return newAsset;
    } catch (error) {
      console.error('Error in createAsset:', error);
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
    console.log('createStrategy started with:', { assetId, strategy });
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      console.log('Auth check result:', { user, userError });
      
      if (userError) throw userError;
      if (!user) throw new Error('No user found');

      // Validate strategy
      if (!strategy.title.trim()) {
        console.log('Strategy title is empty');
        throw new Error('Strategy title is required');
      }

      // Check if parent asset exists
      console.log('Checking for parent asset:', assetId);
      const { data: parentAsset, error: parentError } = await supabase
        .from('strategies')
        .select('id')
        .eq('asset_name', assetId)
        .eq('is_playbook', true)
        .single();

      console.log('Parent asset check result:', { parentAsset, parentError });

      if (parentError) {
        if (parentError.code === 'PGRST116') {
          throw new Error('Parent asset not found');
        }
        throw parentError;
      }

      if (!parentAsset) {
        throw new Error('Parent asset not found');
      }

      // Check for duplicate strategy name within the asset
      console.log('Checking for duplicate strategy name');
      const { data: existingStrategy, error: checkError } = await supabase
        .from('strategies')
        .select('id')
        .eq('user_id', user.id)
        .eq('asset_name', assetId)
        .eq('name', strategy.title)
        .single();

      console.log('Duplicate check result:', { existingStrategy, checkError });

      if (checkError && checkError.code !== 'PGRST116') throw checkError;
      if (existingStrategy) throw new Error('A strategy with this name already exists in this asset');

      // Create the strategy
      console.log('Creating new strategy in database');
      const { data: newStrategy, error: insertError } = await supabase
        .from('strategies')
        .insert({
          user_id: user.id,
          name: strategy.title,
          description: strategy.description,
          type: strategy.type,
          asset_name: assetId,
          parent_id: parentAsset.id,
          rules: strategy.tags,
          icon: strategy.icon,
          is_playbook: false,
          performance_total_trades: 0,
          performance_win_rate: 0,
          performance_average_r: 0,
          performance_profit_factor: 0,
          performance_expectancy: 0,
          performance_largest_win: 0,
          performance_largest_loss: 0,
          performance_average_win: 0,
          performance_average_loss: 0,
          performance_net_pl: 0
        })
        .select()
        .single();

      console.log('Insert result:', { newStrategy, insertError });

      if (insertError) throw insertError;
      if (!newStrategy) throw new Error('Failed to create strategy');

      // Refresh the data
      console.log('Refreshing assets data');
      await fetchAssets();
      console.log('Strategy creation completed successfully');
    } catch (error) {
      console.error('Error in createStrategy:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create strategy';
      toast.error(errorMessage);
      throw error;
    }
  };

  const deleteStrategy = async (assetId: string, strategyId: string) => {
    try {
      // Optimistic update
      setAssets(prev => prev.map(asset => ({
        ...asset,
        strategies: asset.strategies.filter(strategy => strategy.id !== strategyId)
      })));

      const { error } = await supabase
        .from('strategies')
        .delete()
        .eq('id', strategyId);

      if (error) {
        // Revert optimistic update on error
        await fetchAssets();
        throw error;
      }

      toast.success('Strategy deleted successfully');
    } catch (error) {
      console.error('Delete failed:', error);
      toast.error('Failed to delete strategy');
      throw error;
    }
  };

  const updateStrategyIcon = async (strategyId: string, icon: string) => {
    try {
      // Optimistic update
      setAssets(prev => prev.map(asset => ({
        ...asset,
        strategies: asset.strategies.map(strategy => {
          if (strategy.id === strategyId) {
            return { ...strategy, icon };
          }
          return strategy;
        }),
      })));

      const { error } = await supabase
        .from('strategies')
        .update({ icon })
        .eq('id', strategyId);

      if (error) throw error;

      toast.success('Strategy icon updated successfully');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update strategy icon';
      toast.error(errorMessage);
      // Revert optimistic update
      await fetchAssets();
      throw error;
    }
  };

  const updateStrategyRules = async (strategyId: string, rules: string[]) => {
    try {
      // Optimistic update
      setAssets(prev => prev.map(asset => ({
        ...asset,
        strategies: asset.strategies.map(strategy => {
          if (strategy.id === strategyId) {
            return { ...strategy, checklist: rules };
          }
          return strategy;
        }),
      })));

      const { error } = await supabase
        .from('strategies')
        .update({ rules })
        .eq('id', strategyId);

      if (error) throw error;

      toast.success('Strategy rules updated successfully');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update strategy rules';
      toast.error(errorMessage);
      // Revert optimistic update
      await fetchAssets();
      throw error;
    }
  };

  const updateStrategyPerformance = async (strategyId: string, performance: {
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
  }) => {
    try {
      // Optimistic update
      setAssets(prev => prev.map(asset => ({
        ...asset,
        strategies: asset.strategies.map(strategy => {
          if (strategy.id === strategyId) {
            return { ...strategy, performance };
          }
          return strategy;
        }),
      })));

      const { error } = await supabase
        .from('strategies')
        .update({
          performance_total_trades: performance.totalTrades,
          performance_win_rate: performance.winRate,
          performance_average_r: performance.averageR,
          performance_profit_factor: performance.profitFactor,
          performance_expectancy: performance.expectancy,
          performance_largest_win: performance.largestWin,
          performance_largest_loss: performance.largestLoss,
          performance_average_win: performance.averageWin,
          performance_average_loss: performance.averageLoss,
          performance_net_pl: performance.netPL,
        })
        .eq('id', strategyId);

      if (error) throw error;

      toast.success('Strategy performance updated successfully');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update strategy performance';
      toast.error(errorMessage);
      // Revert optimistic update
      await fetchAssets();
      throw error;
    }
  };

  const addMissedTrade = async (assetId: string, trade: any) => {
    try {
      const { error } = await supabase
        .from('strategies')
        .update({
          trades: [...trade],
        })
        .eq('asset_name', assetId);

      if (error) throw error;

      await fetchAssets();
      toast.success('Missed trade added successfully');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to add missed trade';
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
    updateStrategyRules,
    updateStrategyPerformance,
    addMissedTrade,
  };
}; 