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

// Map market categories to valid enum values
const mapMarketCategory = (category: string): 'Equities' | 'Crypto' | 'Forex' | 'Futures' | 'Other' => {
  const categoryMap: { [key: string]: 'Equities' | 'Crypto' | 'Forex' | 'Futures' | 'Other' } = {
    'Major Pairs': 'Forex',
    'Minor Pairs': 'Forex',
    'Exotic Pairs': 'Forex',
    'Cryptocurrency': 'Crypto',
    'Digital Assets': 'Crypto',
    'Stocks': 'Equities',
    'ETFs': 'Equities',
    'Indices': 'Equities',
    'Commodities': 'Futures',
    'Metals': 'Futures',
    'Energy': 'Futures'
  };

  return categoryMap[category] || 'Other';
};

const extractTradesFromImage = async (imageBase64: string): Promise<Trade[]> => {
  const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
  if (!OPENAI_API_KEY) {
    throw new Error('OpenAI API key not found. Please set VITE_OPENAI_API_KEY in your environment variables.');
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'You are a trading expert that specializes in extracting trade information from screenshots of various trading platforms. You can identify and extract trade details from platforms like MT4, MT5, TradingView, and other common trading platforms. Always return data in a consistent JSON format. For dates in DD/MM/YY format (European style), ensure to parse them correctly - for example, 16/05/25 should be interpreted as May 16th, 2025, not as 16th month which would be invalid.'
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Analyze this trading screenshot and extract all visible trades. Look for:
                - Trade entry and exit points
                - Price levels
                - Trade direction (buy/sell)
                - Position sizes
                - Profit/loss values
                - Dates and times (Note: For dates in DD/MM/YY format, interpret as European format)
                - Trading pairs or symbols
                - Market type indicators

                If you see partial information, include what you can find and leave other fields null.
                If you can't find any trade information, explain what's missing.

                For dates in DD/MM/YY format, always interpret as European format (day/month/year).
                Example: 16/05/25 should be interpreted as May 16th, 2025.

                Return the data in this exact JSON format:
                {
                  "trades": [
                    {
                      "symbol": "EURUSD",
                      "entry_date": "2025-05-16T10:30:00Z",  // Note: Date converted to ISO format
                      "entry_price": 1.0850,
                      "exit_date": "2025-05-16T14:45:00Z",
                      "exit_price": 1.0870,
                      "quantity": 1.0,
                      "type": "Long",
                      "pnl": 200,
                      "market": "Forex",
                      "market_category": "Major Pairs"
                    }
                  ],
                  "error": null,
                  "platform_detected": "MT4/MT5/TradingView/etc",
                  "confidence_score": 0.95
                }`
              },
              {
                type: 'image_url',
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
      console.error('API Error:', error);
      if (error.error?.code === 'invalid_api_key') {
        throw new Error('Invalid API key. Please check your API key in the .env file.');
      } else if (error.error?.message?.includes('billing')) {
        throw new Error('OpenAI API billing issue. Please check your OpenAI account billing status.');
      } else if (error.error?.message?.includes('model')) {
        throw new Error('Your API key does not have access to GPT-4o. Please ensure you have access to GPT-4o with vision capabilities.');
      }
      throw new Error(`OpenAI API error: ${error.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    console.log('Raw API Response:', data);
    const content = data.choices[0].message.content;
    console.log('API Content:', content);
    
    try {
      // Clean the content by removing markdown code block formatting
      const cleanContent = content.replace(/```json\s*|\s*```/g, '').trim();
      console.log('Cleaned Content:', cleanContent);
      
      const parsedContent = JSON.parse(cleanContent);
      console.log('Parsed Content:', parsedContent);
      
      // Check if the API found any issues
      if (parsedContent.error) {
        throw new Error(parsedContent.error);
      }

      // Check if any trades were found
      if (!parsedContent.trades || parsedContent.trades.length === 0) {
        throw new Error('No trade information found in the image. Please ensure the screenshot shows trade details clearly.');
      }

      // Check confidence score
      if (parsedContent.confidence_score < 0.7) {
        throw new Error('Low confidence in extracted trade data. Please provide a clearer screenshot.');
      }

      // Map the trades to our Trade type and add metadata
      return parsedContent.trades.map((trade: any) => ({
        ...trade,
        id: uuidv4(),
        market_category: mapMarketCategory(trade.market_category),
        tags: ['AI Imported', `Platform: ${parsedContent.platform_detected}`],
        notes: `Imported via AI image processing\nConfidence Score: ${parsedContent.confidence_score}\nPlatform: ${parsedContent.platform_detected}`,
        status: trade.exit_date ? 'Closed' : 'Open'
      }));
    } catch (error: any) {
      console.error('Parse Error:', error);
      if (error.message.includes('No trade information') || error.message.includes('Low confidence')) {
        throw error;
      }
      throw new Error(`Failed to parse trade data: ${error.message}. Raw content: ${content}`);
    }
  } catch (error: any) {
    console.error('Processing Error:', error);
    if (error.message.includes('Failed to fetch')) {
      throw new Error('Network error. Please check your internet connection and try again.');
    }
    throw error;
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

// Test OpenAI API key and model access
export const testOpenAIAccess = async (): Promise<{ isValid: boolean; message: string }> => {
  const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
  if (!OPENAI_API_KEY) {
    return {
      isValid: false,
      message: 'OpenAI API key not found. Please check your .env file.'
    };
  }

  try {
    // First, test a simple API call to check the API key
    const response = await fetch('https://api.openai.com/v1/models', {
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      }
    });

    if (!response.ok) {
      const error = await response.json();
      if (error.error?.code === 'invalid_api_key') {
        return {
          isValid: false,
          message: 'Invalid API key. Please check your API key in the .env file.'
        };
      }
      throw new Error(error.error?.message || 'Unknown error');
    }

    // If API key is valid, test GPT-4o access with a tiny image
    const tinyImageBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    
    const visionResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: 'What color is in this image?' },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/png;base64,${tinyImageBase64}`
                }
              }
            ]
          }
        ],
        max_tokens: 50
      })
    });

    if (!visionResponse.ok) {
      const error = await visionResponse.json();
      if (error.error?.message?.includes('model')) {
        return {
          isValid: false,
          message: 'Your API key does not have access to GPT-4o. Please make sure you have the correct API access.'
        };
      }
      throw new Error(error.error?.message || 'Unknown error');
    }

    return {
      isValid: true,
      message: 'API key is valid and has access to GPT-4o!'
    };

  } catch (error: any) {
    return {
      isValid: false,
      message: `Error testing API access: ${error.message}`
    };
  }
}; 