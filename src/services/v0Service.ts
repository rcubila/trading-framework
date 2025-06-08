import { supabase } from '../lib/supabase';

interface V0GenerateOptions {
  prompt: string;
  framework?: 'react' | 'next' | 'vue' | 'svelte';
  style?: 'default' | 'modern' | 'minimal' | 'playful';
  theme?: 'light' | 'dark' | 'system';
  components?: string[];
  layout?: 'responsive' | 'fixed';
}

interface V0Response {
  code: string;
  components: {
    name: string;
    code: string;
    dependencies: string[];
  }[];
  styles: {
    css: string;
    tailwind?: string;
  };
}

class V0Service {
  private apiKey: string;
  private baseUrl = 'https://api.v0.dev/api';

  constructor() {
    this.apiKey = import.meta.env.VITE_V0_API_KEY;
    if (!this.apiKey) {
      console.error('V0 API key not found. Please set VITE_V0_API_KEY in your environment variables.');
    }
  }

  async generateUI(options: V0GenerateOptions): Promise<V0Response> {
    try {
      const response = await fetch(`${this.baseUrl}/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          prompt: options.prompt,
          framework: options.framework || 'react',
          style: options.style || 'default',
          theme: options.theme || 'system',
          components: options.components || [],
          layout: options.layout || 'responsive',
        }),
      });

      if (!response.ok) {
        throw new Error(`V0 API error: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error generating UI with v0:', error);
      throw error;
    }
  }

  async saveGeneratedUI(uiData: V0Response, name: string) {
    try {
      const { data, error } = await supabase
        .from('generated_uis')
        .insert([
          {
            name,
            code: uiData.code,
            components: uiData.components,
            styles: uiData.styles,
            created_at: new Date().toISOString(),
          },
        ]);

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error saving generated UI:', error);
      throw error;
    }
  }

  async getGeneratedUIs() {
    try {
      const { data, error } = await supabase
        .from('generated_uis')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching generated UIs:', error);
      throw error;
    }
  }
}

export const v0Service = new V0Service(); 