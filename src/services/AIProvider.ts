/**
 * AI Provider Abstraction Layer
 * Decouples the app from specific AI vendors (Google, OpenAI, etc.)
 * Supports Local/Offline modes and Custom Endpoints.
 */

export interface AIMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface AIProviderConfig {
  mode: 'local' | 'custom';
  customEndpoint?: string;
  customApiKey?: string;
  model?: string;
}

class AIProviderService {
  private config: AIProviderConfig = {
    mode: 'local', // Default to local/offline independence
  };

  configure(config: AIProviderConfig) {
    this.config = { ...this.config, ...config };
  }

  /**
   * Generates a response based on the current mode.
   * In 'local' mode, uses heuristic/scripted responses.
   * In 'custom' mode, fetches from a user-defined endpoint (e.g., Ollama).
   */
  async chat(messages: AIMessage[]): Promise<string> {
    if (this.config.mode === 'custom' && this.config.customEndpoint) {
      return this.fetchCustomEndpoint(messages);
    }
    
    // Local/Offline Fallback - No external dependencies
    return this.generateLocalResponse(messages);
  }

  /**
   * Local Heuristic Engine
   * Provides basic conversational ability without internet/API keys.
   */
  private generateLocalResponse(messages: AIMessage[]): string {
    const lastMessage = messages[messages.length - 1]?.content.toLowerCase() || '';
    
    // Simple pattern matching for independence
    if (lastMessage.includes('hello') || lastMessage.includes('hi')) {
      return "Hello! I'm running in offline mode. How can I help you today?";
    }
    if (lastMessage.includes('weather')) {
      return "I'm currently offline and can't check live weather. Please check your local weather app.";
    }
    if (lastMessage.includes('time')) {
      return `The current time is ${new Date().toLocaleTimeString()}.`;
    }
    if (lastMessage.includes('who are you')) {
      return "I am Brio, your independent digital assistant running locally on your device.";
    }
    if (lastMessage.includes('joke')) {
      const jokes = [
        "Why do programmers prefer dark mode? Because light attracts bugs.",
        "I would tell you a UDP joke, but you might not get it.",
        "There are only 10 types of people in the world: those who understand binary and those who don't."
      ];
      return jokes[Math.floor(Math.random() * jokes.length)];
    }
    
    return "I'm running in local offline mode. To enable advanced AI, please configure a custom endpoint in Settings > AI.";
  }

  /**
   * Fetches from a custom endpoint (e.g., http://localhost:11434/api/generate for Ollama)
   */
  private async fetchCustomEndpoint(messages: AIMessage[]): Promise<string> {
    try {
      const response = await fetch(this.config.customEndpoint!, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.config.customApiKey ? { 'Authorization': `Bearer ${this.config.customApiKey}` } : {}),
        },
        body: JSON.stringify({
          model: this.config.model || 'llama3',
          messages: messages,
          stream: false
        }),
      });

      if (!response.ok) throw new Error('Custom AI endpoint failed');
      
      const data = await response.json();
      // Adapt based on common API structures (Ollama, OpenAI-compatible)
      return data.message?.content || data.response || data.choices?.[0]?.message?.content || "No response from custom endpoint.";
    } catch (error) {
      console.error('Custom AI Error:', error);
      return "Error connecting to custom AI endpoint. Falling back to local mode.";
    }
  }

  /**
   * Image Processing: Face Enhancement
   * Implemented purely client-side using Canvas API for independence.
   */
  async enhanceFace(imageFile: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = URL.createObjectURL(imageFile);
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas not supported'));
          return;
        }

        canvas.width = img.width;
        canvas.height = img.height;

        // Draw original
        ctx.drawImage(img, 0, 0);

        // Apply "Enhancement" filters locally
        // 1. Sharpening simulation via contrast
        ctx.filter = 'contrast(1.1) brightness(1.05) saturate(1.2)';
        
        // 2. Soften skin (simulated by slight blur then sharpening edges - simplified here)
        // In a real independent app, we might load a WASM module for true face detection,
        // but for now, we apply global aesthetic improvements.
        ctx.drawImage(canvas, 0, 0);
        
        // Reset filter for final draw if needed, but we already drew with filter
        
        resolve(canvas.toDataURL('image/jpeg', 0.9));
      };
      img.onerror = () => reject(new Error('Failed to load image'));
    });
  }

  /**
   * Text Summarization (Local)
   * Extractive summarization using simple frequency analysis.
   */
  summarizeText(text: string): string {
    const sentences = text.match(/[^\.!\?]+[\.!\?]+/g);
    if (!sentences || sentences.length <= 2) return text;

    // Score sentences by word frequency (very basic NLP)
    const wordFreq: Record<string, number> = {};
    const words = text.toLowerCase().match(/\b\w+\b/g) || [];
    
    const stopWords = new Set(['the', 'is', 'at', 'which', 'on', 'a', 'an', 'and', 'or', 'but']);

    words.forEach(word => {
      if (!stopWords.has(word)) {
        wordFreq[word] = (wordFreq[word] || 0) + 1;
      }
    });

    const sentenceScores = sentences.map((sentence, index) => {
      const score = sentence.toLowerCase().split(/\s+/).reduce((acc, word) => {
        return acc + (wordFreq[word.replace(/[^\w]/g, '')] || 0);
      }, 0);
      return { sentence, score, index };
    });

    // Take top 2 sentences, preserve original order
    const topSentences = sentenceScores
      .sort((a, b) => b.score - a.score)
      .slice(0, 2)
      .sort((a, b) => a.index - b.index)
      .map(s => s.sentence);

    return topSentences.join(' ');
  }
}

export const AIProvider = new AIProviderService();
