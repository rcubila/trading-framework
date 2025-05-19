# Trade Import System Documentation

## Overview
The trade import system provides a robust way to import trades into the application via CSV files. It includes validation, transformation, and error handling to ensure data integrity.

## Components

### 1. Import Service (`src/services/importService.ts`)
- Handles trade validation and transformation
- Manages database insertion with error handling
- Provides detailed import results

Key features:
- Validates required fields
- Checks data types and formats
- Transforms raw data to match database schema
- Uses transactions for atomic imports
- Provides detailed error reporting

### 2. CSV Parser (`src/utils/csvParser.ts`)
- Handles CSV file parsing
- Provides type-safe parsing with error handling
- Includes CSV download functionality

Features:
- Header transformation
- Empty line skipping
- Type-safe parsing
- Error handling
- CSV download utility

### 3. Trade Template (`src/utils/tradeTemplate.ts`)
- Provides sample trade data
- Allows users to download a template CSV

Sample fields:
- Market and category
- Symbol and type
- Entry/exit prices and dates
- PnL and metrics
- Strategy and tags
- Risk management parameters

### 4. Import Component (`src/components/TradeImport.tsx`)
- User interface for file upload
- Template download option
- Import progress and results display
- Error handling and feedback

## Data Flow

1. **Template Download**
   - User downloads the template CSV
   - Template shows required fields and format
   - Includes sample data for reference

2. **File Preparation**
   - User prepares CSV following template
   - Required fields must be included
   - Data should match expected formats

3. **File Upload**
   - User selects CSV file
   - System validates file format
   - Shows upload progress

4. **Data Processing**
   - System parses CSV file
   - Validates each trade entry
   - Transforms data to match schema
   - Handles errors gracefully

5. **Database Import**
   - Valid trades are imported
   - Uses transaction for data integrity
   - Updates import statistics

6. **Result Feedback**
   - Shows import summary
   - Lists any errors or warnings
   - Provides next steps

## Required Fields

```csv
market,market_category,symbol,type,entry_price,quantity,entry_date
```

Optional fields:
```csv
status,exit_price,exit_date,pnl,pnl_percentage,risk,reward,strategy,tags,notes,leverage,stop_loss,take_profit,commission,fees,slippage,exchange,timeframe,setup_type
```

## Validation Rules

1. **Required Fields**
   - market
   - market_category
   - symbol
   - type
   - entry_price
   - quantity
   - entry_date

2. **Data Types**
   - market_category: ['Equities', 'Crypto', 'Forex', 'Futures', 'Other']
   - type: ['Long', 'Short']
   - status: ['Open', 'Closed']
   - Numeric fields: entry_price, quantity, pnl, etc.
   - Date fields: ISO 8601 format

3. **Formatting**
   - Symbols are automatically converted to uppercase
   - Dates must be valid ISO 8601 format
   - Numbers must be valid decimal values
   - Tags must be an array

## Error Handling

The system provides detailed error messages for:
- Missing required fields
- Invalid data types
- Format errors
- Database errors
- File parsing errors

## Best Practices

1. **File Preparation**
   - Use the template as a guide
   - Validate data before import
   - Check date formats
   - Ensure numeric values are correct

2. **Import Process**
   - Start with a small test file
   - Review error messages carefully
   - Fix issues in the source file
   - Use transactions for data integrity

3. **Data Quality**
   - Validate data before import
   - Use consistent formats
   - Include all relevant information
   - Document any special cases

## Setup

1. Install dependencies:
   ```bash
   npm install papaparse @types/papaparse
   ```

2. Configure Supabase client in `src/lib/supabaseClient.ts`

3. Add the TradeImport component to your desired page/route

## Usage Example

```typescript
import { TradeImport } from '../components/TradeImport';

function YourPage() {
  return (
    <div>
      <h1>Import Trades</h1>
      <TradeImport />
    </div>
  );
}
``` 