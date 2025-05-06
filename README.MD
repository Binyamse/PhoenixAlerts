# PhoenixAlerts

![License](https://img.shields.io/github/license/Binyamse/PhoenixAlerts)
![GitHub Workflow Status](https://img.shields.io/github/actions/workflow/status/Binyamse/PhoenixAlerts/docker-publish.yml)
![GitHub release (latest SemVer)](https://img.shields.io/github/v/release/Binyamse/PhoenixAlerts)
[![Artifact Hub](https://img.shields.io/endpoint?url=https://artifacthub.io/badge/repository/phoenix-alerts)](https://artifacthub.io/packages/helm/phoenix-alerts/phoenix-alerts)

PhoenixAlerts enhances Kubernetes monitoring by applying AI-powered decision-making to Prometheus alerts. It helps reduce alert fatigue by automatically silencing notifications for known patterns while providing enriched context for alerts that require attention.

![PhoenixAlerts Dashboard](docs/images/dashboard.png)

## 🚀 Features

- **AI-Powered Alert Triage**: Automatically decides whether to forward or silence alerts based on historical patterns
- **Pattern Learning**: Identifies recurring patterns (e.g., alerts that self-resolve during maintenance windows)
- **Enriched Notifications**: Adds LLM-generated explanations and debugging steps to alerts
- **Historical Data**: Maintains a database of all alerts for continuous learning
- **Feedback Mechanism**: Users can provide feedback to improve AI decisions
- **User-Friendly Dashboard**: View alert statistics, patterns, and manage settings

## 📋 Components

### Backend Server
- Node.js/Express application that:
  - Receives webhook notifications from Prometheus Alert Manager
  - Processes alerts using AI
  - Stores alert data in MongoDB
  - Communicates with LLM API (OpenAI)

### Frontend Dashboard
- React application with:
  - Alert overview and statistics
  - Alert history with filtering
  - Detailed alert view with feedback mechanism
  - AI prediction patterns
  - System settings

## 📦 Installation

### Prerequisites
- Kubernetes cluster with Prometheus and Alert Manager
- MongoDB instance
- LLM provider access (one of the following):
  - OpenAI API key
  - Anthropic API key
  - Azure OpenAI API key and endpoint
  - Hugging Face API key
  - Or use the built-in Ollama deployment (no API key required)
- Slack webhook URL (for notifications)

### Using Helm (Recommended)

Add the PhoenixAlerts Helm repository:

```bash
helm repo add phoenix-alerts https://binyamse.github.io/PhoenixAlerts
helm repo update
```

Install the chart with custom values:

```bash
helm install phoenix-alerts phoenix-alerts/phoenix-alerts \
  --values values.yaml \
  --namespace monitoring \
  --create-namespace
```

Example values.yaml:

```yaml
# Choose your LLM provider
llm:
  provider: "openai"  # Options: "openai", "anthropic", "azure", "huggingface", "ollama"
  selectedModel: "gpt-4-turbo"  # Optional: specify a model, or leave empty to use the default

# Secret management - Option 1: Reference existing secrets
secrets:
  useExisting: true
  existingSecrets:
    openAi: "my-openai-secret"  # Secret must have key 'api-key'
    mongodb: "my-mongodb-secret"  # Secret must have key 'mongodb-uri'
    slack: "my-slack-secret"  # Secret must have key 'webhook-url'

# Secret management - Option 2: Provide secret values (only if useExisting is false)
# secrets:
#   useExisting: false
#   secretValues:
#     openAiApiKey: "your-openai-api-key"
#     mongodbUri: "mongodb://user:pass@host:port/db"
#     slackWebhookUrl: "https://hooks.slack.com/..."

# If using Ollama as provider
# llm:
#   provider: "ollama"
#   selectedModel: "llama3"  # Optional, defaults to "llama2" if not specified
# 
# ollama:
#   resources:
#     limits:
#       cpu: 4000m
#       memory: 12Gi
#   config:
#     gpu:
#       enabled: true  # Set to true if you have GPU nodes available
#       type: "nvidia"  # nvidia or amd
#   persistence:
#     size: 40Gi  # Increase for storing multiple models

mongodb:
  auth:
    rootPassword: "rootpassword"
    password: "userpassword"
  
ingress:
  enabled: true
  hosts:
    - host: alerts.example.com
      paths:
        - path: /
          pathType: Prefix
          service: frontend
        - path: /api
          pathType: Prefix
          service: backend
```

### Manual Installation

1. Clone the repository:
```bash
git clone https://github.com/Binyamse/PhoenixAlerts.git
cd PhoenixAlerts
```

2. Create a Kubernetes secret:
```bash
kubectl create secret generic phoenix-alerts-secrets \
  --from-literal=mongodb-uri="mongodb://user:pass@mongodb:27017/alerts" \
  --from-literal=openai-api-key="your-openai-api-key" \
  --from-literal=slack-webhook-url="your-slack-webhook-url" \
  --namespace monitoring
```

3. Deploy to Kubernetes:
```bash
kubectl apply -f kubernetes/deployment.yaml
kubectl apply -f kubernetes/service.yaml
```

4. Configure Alert Manager:
```bash
kubectl apply -f kubernetes/alertmanager-config.yaml
```

## 🛠️ Development

### Prerequisites
- Node.js 18+
- Docker and Docker Compose
- MongoDB (local or remote)
- OpenAI API key

### Local Development

1. Clone the repository:
```bash
git clone https://github.com/Binyamse/PhoenixAlerts.git
cd PhoenixAlerts
```

2. Setup environment variables:
```bash
# In backend directory
cp .env.example .env
# Edit .env with your configuration
```

3. Install dependencies and start development servers:
```bash
# Backend
cd backend
npm install
npm run dev

# Frontend (in a new terminal)
cd frontend
npm install
npm start
```

4. Access the development server:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8080

### Docker Development

```bash
docker-compose up -d
```

## 🔄 How It Works

1. An alert fires in Prometheus
2. Alert Manager sends the alert to PhoenixAlerts webhook
3. PhoenixAlerts:
   - Analyzes the alert using historical data
   - Determines whether to silence or forward based on patterns
   - Enriches the alert with AI-generated context
   - Stores the alert in the database
   - Sends a notification to Slack if not silenced

## 📊 Dashboard

- **Dashboard**: View overall statistics and recent alerts
- **Alerts**: Browse all alerts with filtering options
- **Alert Detail**: View detailed information about an alert and provide feedback
- **Predictions**: See AI-identified patterns and predicted behaviors
- **Settings**: Configure system behavior, AI settings, and notification preferences

## 📋 Configuring Alert Manager

To integrate PhoenixAlerts with Prometheus Alert Manager, configure a webhook receiver:

```yaml
receivers:
- name: 'phoenix-alerts'
  webhook_configs:
  - url: 'http://phoenix-alerts-backend:3000/api/alerts'
    send_resolved: true
```

Add the receiver to your routing tree in AlertManager configuration:

```yaml
route:
  receiver: 'default-receiver'
  group_by: ['alertname', 'job']
  group_wait: 30s
  group_interval: 5m
  repeat_interval: 12h
  routes:
  - receiver: 'phoenix-alerts'
    match:
      severity: warning
    continue: true  # Continue to other matching routes
```

## 🧪 Testing

Run tests for the backend:

```bash
cd backend
npm test
```

Run tests for the frontend:

```bash
cd frontend
npm test
```

## 📃 API Documentation

API documentation is available at `/api/docs` when the backend is running.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Please read our [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct, and the process for submitting pull requests.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgements

- [Prometheus](https://prometheus.io/) - Monitoring system & time series database
- [Alert Manager](https://prometheus.io/docs/alerting/latest/alertmanager/) - Handles alerts from Prometheus
- [OpenAI](https://openai.com/) - Provider of the AI models used for alert analysis
- [React](https://reactjs.org/) - Frontend framework
- [Express](https://expressjs.com/) - Backend framework
- [MongoDB](https://www.mongodb.com/) - Database for storing alert history

## 📊 Screenshots

### Dashboard Overview
![Dashboard Overview](docs/images/overview.png)

### Alert Detail View
![Alert Detail](docs/images/alert-detail.png)

### Pattern Analysis
![Pattern Analysis](docs/images/patterns.png)

## 📞 Contact

Project Link: [https://github.com/Binyamse/PhoenixAlerts](https://github.com/Binyamse/PhoenixAlerts)

---

<p align="center">Made with ❤️ for SREs and DevOps Engineers</p>