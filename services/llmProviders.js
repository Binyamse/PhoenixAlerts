const axios = require('axios');

/**
 * Base LLM Provider class
 */
class BaseLLMProvider {
  constructor(config) {
    this.config = config;
  }

  async complete(prompt) {
    throw new Error('Method not implemented in base class');
  }
}

/**
 * OpenAI Provider
 */
class OpenAIProvider extends BaseLLMProvider {
  async complete(prompt) {
    try {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: this.config.model || 'gpt-4',
          messages: [
            { role: 'system', content: 'You are an expert Kubernetes administrator.' },
            { role: 'user', content: prompt }
          ],
          max_tokens: 500
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.config.apiKey}`
          }
        }
      );

      return response.data.choices[0].message.content;
    } catch (error) {
      console.error('OpenAI API error:', error);
      throw error;
    }
  }
}

/**
 * Groq Provider - Compatible with OpenAI API
 */
class GroqProvider extends BaseLLMProvider {
  async complete(prompt) {
    try {
      const response = await axios.post(
        'https://api.groq.com/openai/v1/chat/completions',
        {
          model: this.config.model || 'llama-3.3-70b-versatile',
          messages: [
            { role: 'system', content: 'You are an expert Kubernetes administrator.' },
            { role: 'user', content: prompt }
          ],
          max_tokens: 500
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.config.apiKey}`
          }
        }
      );

      return response.data.choices[0].message.content;
    } catch (error) {
      console.error('Groq API error:', error);
      throw error;
    }
  }
}

/**
 * Ollama Provider - For local LLM deployment
 */
class OllamaProvider extends BaseLLMProvider {
  async complete(prompt) {
    try {
      const endpoint = this.config.endpoint || 'http://localhost:11434';
      const response = await axios.post(
        `${endpoint}/api/generate`,
        {
          model: this.config.model || 'llama3',
          prompt: prompt,
          stream: false
        }
      );

      return response.data.response;
    } catch (error) {
      console.error('Ollama API error:', error);
      throw error;
    }
  }
}

/**
 * LocalAI Provider - Similar to Ollama but with different API
 */
class LocalAIProvider extends BaseLLMProvider {
  async complete(prompt) {
    try {
      const endpoint = this.config.endpoint || 'http://localhost:8080';
      const response = await axios.post(
        `${endpoint}/v1/completions`,
        {
          model: this.config.model || 'llama3',
          prompt: prompt,
          max_tokens: 500
        }
      );

      return response.data.choices[0].text;
    } catch (error) {
      console.error('LocalAI API error:', error);
      throw error;
    }
  }
}

/**
 * Factory for creating LLM providers
 */
class LLMProvider {
  static create(provider, config) {
    switch (provider.toLowerCase()) {
      case 'openai':
        return new OpenAIProvider(config);
      case 'groq':
        return new GroqProvider(config);
      case 'ollama':
        return new OllamaProvider(config);
      case 'localai':
        return new LocalAIProvider(config);
      default:
        throw new Error(`Unsupported LLM provider: ${provider}`);
    }
  }
}

module.exports = { LLMProvider };
