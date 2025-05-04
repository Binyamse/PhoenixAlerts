module.exports = {
  // Default provider settings
  defaultProvider: process.env.LLM_PROVIDER || 'openai',
  
  // Provider-specific settings
  providers: {
    openai: {
      apiKey: process.env.OPENAI_API_KEY,
      model: process.env.OPENAI_MODEL || 'gpt-4',
      temperature: 0.7
    },
    groq: {
      apiKey: process.env.GROQ_API_KEY,
      model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
      endpoint: 'https://api.groq.com/openai/v1'
    },
    ollama: {
      endpoint: process.env.OLLAMA_ENDPOINT || 'http://localhost:11434',
      model: process.env.OLLAMA_MODEL || 'llama3'
    },
    localai: {
      endpoint: process.env.LOCALAI_ENDPOINT || 'http://localhost:8080',
      model: process.env.LOCALAI_MODEL || 'ggml-gpt4all-j'
    }
  }
};
