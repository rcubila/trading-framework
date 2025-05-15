import type { Trade } from '../types/trade';

interface ImageImportResult {
  trades: Trade[];
  errors: ImportError[];
}

interface ImportError {
  row: number;
  message: string;
}

// UUID v4 generator
const uuidv4 = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

const convertImageToBase64 = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64String = reader.result as string;
      // Extract the base64 data after the comma
      const base64Data = base64String.split(',')[1];
      resolve(base64Data);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

const extractTradesFromImage = async (imageBase64: string): Promise<Trade[]> => {
  const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
  if (!OPENAI_API_KEY) {
    throw new Error('OpenAI API key not found. Please set VITE_OPENAI_API_KEY in your environment variables.');
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4-vision',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `Please analyze this trading screenshot and extract all trades in JSON format. For each trade, include:
              - Symbol
              - Entry Date and Time
              - Entry Price
              - Exit Date and Time (if closed)
              - Exit Price (if closed)
              - Quantity/Volume
              - Type (Long/Short)
              - Profit/Loss (if closed)
              - Market (e.g., Stocks, Forex, Crypto)
              - Market Category
              
              Return ONLY the JSON array of trades, no other text. Each trade should match this format:
              {
                "symbol": "EURUSD",
                "entry_date": "2024-03-18T10:30:00Z",
                "entry_price": 1.0850,
                "exit_date": "2024-03-18T14:45:00Z",
                "exit_price": 1.0870,
                "quantity": 1.0,
                "type": "Long",
                "pnl": 200,
                "market": "Forex",
                "market_category": "Major Pairs"
              }`
            },
            {
              type: 'image',
              image_url: {
                url: `data:image/jpeg;base64,${imageBase64}`
              }
            }
          ]
        }
      ],
      max_tokens: 4000,
      temperature: 0
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`OpenAI API error: ${error.error?.message || 'Unknown error'}`);
  }

  const data = await response.json();
  const content = data.choices[0].message.content;
  
  try {
    const extractedTrades = JSON.parse(content);
    return extractedTrades.map((trade: any) => ({
      ...trade,
      id: uuidv4(),
      tags: ['AI Imported'],
      notes: 'Imported via AI image processing',
      status: trade.exit_date ? 'Closed' : 'Open'
    }));
  } catch (error) {
    throw new Error('Failed to parse AI response as JSON');
  }
};

export const processTradeImages = async (images: File[]): Promise<ImageImportResult> => {
  const errors: ImportError[] = [];
  const trades: Trade[] = [];

  try {
    for (let i = 0; i < images.length; i++) {
      try {
        const image = images[i];
        const base64Image = await convertImageToBase64(image);
        const extractedTrades = await extractTradesFromImage(base64Image);
        trades.push(...extractedTrades);
      } catch (error: any) {
        errors.push({
          row: i,
          message: `Failed to process image ${images[i].name}: ${error?.message || 'Unknown error'}`
        });
      }
    }

    if (trades.length === 0 && errors.length === 0) {
      errors.push({
        row: 0,
        message: 'No trades could be extracted from the images. Please ensure the screenshots clearly show trade details.'
      });
    }

    return { trades, errors };
  } catch (error: any) {
    errors.push({
      row: 0,
      message: `Failed to process images: ${error?.message || 'Unknown error'}`
    });
    return { trades, errors };
  }
}; 