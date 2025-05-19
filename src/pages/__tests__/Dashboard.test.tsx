import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import Dashboard from '../Dashboard';
import { supabase } from '../../lib/supabase';
import Cache from '../../utils/cache';

// Mock supabase
vi.mock('../../lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue({
        data: [],
        error: null
      })
    }))
  }
}));

// Mock Cache
vi.mock('../../utils/cache', () => ({
  default: {
    get: vi.fn(),
    set: vi.fn(),
    clear: vi.fn()
  }
}));

// Mock Chart.js
vi.mock('chart.js', () => ({
  Chart: vi.fn(),
  registerables: [],
  register: vi.fn(),
  CategoryScale: vi.fn(),
  LinearScale: vi.fn(),
  PointElement: vi.fn(),
  LineElement: vi.fn(),
  BarElement: vi.fn(),
  Title: vi.fn(),
  Tooltip: vi.fn(),
  Legend: vi.fn(),
  Filler: vi.fn(),
}));

// Mock react-chartjs-2
vi.mock('react-chartjs-2', () => ({
  Line: () => <div data-testid="mock-line-chart" />,
  Bar: () => <div data-testid="mock-bar-chart" />,
}));

describe('Dashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock empty cache
    (Cache.get as jest.Mock).mockResolvedValue(null);
  });

  it('renders dashboard title', async () => {
    render(<Dashboard />);
    await waitFor(() => {
      expect(screen.getByText('Trading Dashboard')).toBeInTheDocument();
    });
  });

  it('renders performance metrics section', async () => {
    render(<Dashboard />);
    await waitFor(() => {
      expect(screen.getByText('Performance Metrics')).toBeInTheDocument();
      expect(screen.getByText('Win Rate')).toBeInTheDocument();
      expect(screen.getByText('Profit Factor')).toBeInTheDocument();
      expect(screen.getByText('Sharpe Ratio')).toBeInTheDocument();
    });
  });

  it('renders chart section', async () => {
    render(<Dashboard />);
    await waitFor(() => {
      expect(screen.getByText('Performance Chart')).toBeInTheDocument();
      expect(screen.getByTestId('mock-line-chart')).toBeInTheDocument();
    });
  });

  it('fetches data from cache first', async () => {
    const mockTrades = [
      { id: 1, pnl: 100, entry_date: '2024-03-20' },
      { id: 2, pnl: -50, entry_date: '2024-03-21' }
    ];
    (Cache.get as jest.Mock).mockResolvedValue(mockTrades);

    render(<Dashboard />);
    
    await waitFor(() => {
      expect(Cache.get).toHaveBeenCalled();
      expect(supabase.from).not.toHaveBeenCalled();
    });
  });

  it('fetches data from Supabase when cache is empty', async () => {
    render(<Dashboard />);
    
    await waitFor(() => {
      expect(Cache.get).toHaveBeenCalled();
      expect(supabase.from).toHaveBeenCalled();
    });
  });
}); 