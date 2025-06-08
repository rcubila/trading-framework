# TradesList Component

A reusable component for displaying a list of trades with features like selection, pagination, and actions.

## Features

- Displays trades in a virtualized list for better performance
- Supports trade selection (single and multi-select)
- Includes pagination with configurable page size
- Provides actions for each trade (edit, delete, etc.)
- Shows loading and error states
- Supports infinite scrolling
- Responsive design with proper spacing and layout

## Props

```typescript
interface TradesListProps {
  // Function to fetch trades with pagination
  fetchTrades: (page: number, pageSize: number) => Promise<Trade[]>;
  
  // Initial page size for the list
  initialPageSize?: number;
  
  // Callback when a trade is clicked
  onTradeClick: (trade: Trade) => void;
  
  // Callback when delete action is triggered
  onDeleteClick: (trade: Trade) => void;
  
  // Set of selected trade IDs
  selectedTrades: Set<string>;
  
  // Callback when a trade is selected
  onSelectTrade: (trade: Trade) => void;
  
  // Callback when all trades are selected
  onSelectAll: (trades: Trade[]) => void;
  
  // Number to trigger refresh
  refreshTrigger: number;
}
```

## Usage

```tsx
import { TradesList } from './components/TradesList';

const MyComponent = () => {
  const [selectedTrades, setSelectedTrades] = useState<Set<string>>(new Set());
  
  const handleSelectTrade = (trade: Trade) => {
    setSelectedTrades(prev => {
      const next = new Set(prev);
      if (next.has(trade.id)) {
        next.delete(trade.id);
      } else {
        next.add(trade.id);
      }
      return next;
    });
  };

  return (
    <TradesList
      fetchTrades={fetchTrades}
      initialPageSize={10}
      onTradeClick={handleTradeClick}
      onDeleteClick={handleDeleteClick}
      selectedTrades={selectedTrades}
      onSelectTrade={handleSelectTrade}
      onSelectAll={handleSelectAll}
      refreshTrigger={refreshTrigger}
    />
  );
};
```

## Styling

The component uses CSS Modules with BEM naming convention. All styles are scoped to the component and use CSS variables for theming.

Key style features:
- Responsive grid layout for trade items
- Hover and active states for interactive elements
- Loading skeleton animation
- Error state styling
- Proper spacing and typography

## Dependencies

- react-window: For virtualized list rendering
- react-icons: For action icons
- CSS Modules: For scoped styling

## Accessibility

- Proper ARIA attributes for interactive elements
- Keyboard navigation support
- Focus management for dropdowns
- Color contrast compliance
- Screen reader friendly structure

## Performance Considerations

- Uses virtualized list for efficient rendering
- Implements infinite scrolling
- Optimized re-renders with React.memo
- Efficient state management
- Debounced scroll handling

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- IE11 not supported 