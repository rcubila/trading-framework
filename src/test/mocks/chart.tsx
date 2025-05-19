import { vi } from 'vitest';
import React from 'react';

// Mock Chart.js
vi.mock('chart.js', () => ({
  Chart: vi.fn(),
  registerables: [],
  Line: vi.fn(),
  Bar: vi.fn(),
  Doughnut: vi.fn(),
  Pie: vi.fn(),
  Scatter: vi.fn(),
  Bubble: vi.fn(),
  PolarArea: vi.fn(),
  Radar: vi.fn(),
  CategoryScale: vi.fn(),
  LinearScale: vi.fn(),
  PointElement: vi.fn(),
  LineElement: vi.fn(),
  BarElement: vi.fn(),
  Title: vi.fn(),
  Tooltip: vi.fn(),
  Legend: vi.fn(),
  register: vi.fn(),
  ArcElement: vi.fn(),
  RadialLinearScale: vi.fn(),
}));

// Mock react-chartjs-2
vi.mock('react-chartjs-2', () => ({
  Line: () => React.createElement('div', { 'data-testid': 'mock-line-chart' }),
  Bar: () => React.createElement('div', { 'data-testid': 'mock-bar-chart' }),
  Doughnut: () => React.createElement('div', { 'data-testid': 'mock-doughnut-chart' }),
  Pie: () => React.createElement('div', { 'data-testid': 'mock-pie-chart' }),
  Scatter: () => React.createElement('div', { 'data-testid': 'mock-scatter-chart' }),
  Bubble: () => React.createElement('div', { 'data-testid': 'mock-bubble-chart' }),
  PolarArea: () => React.createElement('div', { 'data-testid': 'mock-polar-area-chart' }),
  Radar: () => React.createElement('div', { 'data-testid': 'mock-radar-chart' }),
})); 