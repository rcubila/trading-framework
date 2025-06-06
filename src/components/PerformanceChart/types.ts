import { LineChart, BarChart2 } from 'lucide-react';

export type ChartType = 'line' | 'bar';

export interface ChartTypeOption {
  id: ChartType;
  icon: typeof LineChart | typeof BarChart2;
  label: string;
}

export const chartTypes: ChartTypeOption[] = [
  { id: 'line', icon: LineChart, label: 'Line' },
  { id: 'bar', icon: BarChart2, label: 'Bar' }
]; 