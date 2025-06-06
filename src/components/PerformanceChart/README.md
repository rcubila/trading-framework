# PerformanceChart Component

A reusable chart component for displaying performance data using Chart.js. Supports both line and bar chart types with consistent styling and theming.

## Features

- Line and bar chart support
- Responsive design
- Customizable height
- Title and subtitle support
- Consistent theming with CSS variables
- Tooltip formatting for currency values
- Grid styling with theme colors

## Props

```typescript
interface PerformanceChartProps {
  data: {
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      borderColor?: string;
      backgroundColor?: string;
      fill?: boolean;
      tension?: number;
      borderWidth?: number;
      pointRadius?: number;
      pointHoverRadius?: number;
    }[];
  };
  type: 'line' | 'bar';
  title?: string;
  subtitle?: string;
  height?: number;
  className?: string;
}
```

## Usage

```tsx
import { PerformanceChart } from './PerformanceChart';

const data = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
  datasets: [{
    label: 'Account Balance',
    data: [1000, 1200, 1150, 1300, 1400],
    borderColor: '#3b82f6',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    fill: true,
    tension: 0.4
  }]
};

const MyComponent = () => (
  <PerformanceChart
    data={data}
    type="line"
    title="Account Performance"
    subtitle="Last 5 months"
    height={400}
  />
);
```

## Styling

The component uses CSS modules and follows the project's theming system. It uses the following CSS variables:

- `--color-text-primary`: Primary text color
- `--color-text-secondary`: Secondary text color
- `--color-text-muted`: Muted text color
- `--color-background`: Background color for tooltips
- `--color-border`: Border color
- `--color-grid`: Grid line color

## Best Practices

1. Always provide meaningful labels for the data
2. Use consistent colors across related charts
3. Consider the chart height based on the amount of data
4. Use the subtitle to provide additional context
5. Keep the number of datasets reasonable (1-3 recommended)

## Accessibility

- Chart is responsive and works with screen readers
- Tooltips are keyboard accessible
- Colors meet WCAG contrast requirements
- Text is properly sized and readable 