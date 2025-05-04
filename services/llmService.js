const axios = require('axios');
const { LLMProvider } = require('./llmProviders');

/**
 * LLM Service that supports both cloud-based and local LLMs
 */
class LLMService {
  constructor(config = {}) {
    // Use environment variables as fallbacks
    this.provider = config.provider || process.env.LLM_PROVIDER || 'openai';
    
    // Set endpoint based on provider if not specified
    this.endpoint = config.endpoint || 
      (this.provider === 'ollama' ? process.env.OLLAMA_ENDPOINT : 
       this.provider === 'localai' ? process.env.LOCALAI_ENDPOINT : 
       null);
    
    // Set API key based on provider
    this.apiKey = config.apiKey || 
      (this.provider === 'openai' ? process.env.OPENAI_API_KEY : 
       this.provider === 'groq' ? process.env.GROQ_API_KEY : 
       null);
    
    // Set model based on provider
    this.model = config.model || 
      (this.provider === 'openai' ? process.env.OPENAI_MODEL : 
       this.provider === 'groq' ? process.env.GROQ_MODEL :
       this.provider === 'ollama' ? process.env.OLLAMA_MODEL :
       this.provider === 'localai' ? process.env.LOCALAI_MODEL :
       'llama3');
    
    console.log(`Initializing LLM Service with provider: ${this.provider}, model: ${this.model}`);
    
    // Initialize the appropriate provider
    this.llmProvider = LLMProvider.create(this.provider, {
      apiKey: this.apiKey,
      endpoint: this.endpoint,
      model: this.model
    });
  }

  /**
   * Analyze an alert with the configured LLM
   * @param {Object} alertData - Alert data to analyze
   * @returns {Promise<string>} - LLM analysis
   */
  async analyzeAlert(alertData) {
    try {
      const prompt = this.formatAlertPrompt(alertData);
      const response = await this.llmProvider.complete(prompt);
      return response;
    } catch (error) {
      console.error('Error analyzing alert with LLM:', error);
      return 'Unable to generate analysis due to error with LLM service.';
    }
  }

  /**
   * Generate debugging steps for an alert
   * @param {Object} alertData - Alert data
   * @returns {Promise<Array<string>>} - Array of debug steps
   */
  async generateDebugSteps(alertData) {
    try {
      const prompt = this.formatDebugPrompt(alertData);
      const response = await this.llmProvider.complete(prompt);
      
      // Convert response to array of steps
      return response.split('\n').filter(step => step.trim() !== '');
    } catch (error) {
      console.error('Error generating debug steps with LLM:', error);
      return ['Check pod logs', 'Check pod events', 'Check node status'];
    }
  }

  /**
   * Format a prompt for alert analysis
   * @param {Object} alertData - Alert data
   * @returns {string} - Formatted prompt
   */
  formatAlertPrompt(alertData) {
    return `You are an expert Kubernetes administrator. Analyze the following alert and provide a concise explanation of what it means and its potential impact.
    
Alert Name: ${alertData.alertName}
Status: ${alertData.status}
Pod: ${alertData.podName}
Namespace: ${alertData.namespace}
Cluster: ${alertData.cluster}
Labels: ${JSON.stringify(alertData.labels)}
Annotations: ${JSON.stringify(alertData.annotations)}

Your analysis:`;
  }

  /**
   * Format a prompt for debug steps generation
   * @param {Object} alertData - Alert data
   * @returns {string} - Formatted prompt
   */
  formatDebugPrompt(alertData) {
    return `You are an expert Kubernetes administrator. Provide a list of debugging steps for the following alert.
    
Alert Name: ${alertData.alertName}
Status: ${alertData.status}
Pod: ${alertData.podName}
Namespace: ${alertData.namespace}
Cluster: ${alertData.cluster}
Labels: ${JSON.stringify(alertData.labels)}
Annotations: ${JSON.stringify(alertData.annotations)}

List specific debugging steps, one per line:`;
  }
}

module.exports = LLMService;
