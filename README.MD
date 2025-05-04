# AI-Powered Prometheus Alert Manager

This application enhances Kubernetes monitoring by applying AI-powered decision-making to Prometheus alerts. It helps reduce alert fatigue by automatically silencing notifications for known patterns while providing enriched context for alerts that require attention.

## Key Features

- **AI-Powered Alert Triage**: Automatically decides whether to forward or silence alerts based on historical patterns
- **Pattern Learning**: Identifies recurring patterns (e.g., alerts that self-resolve during maintenance windows)
- **Enriched Notifications**: Adds LLM-generated explanations and debugging steps to alerts
- **Historical Data**: Maintains a database of all alerts for continuous learning
- **Feedback Mechanism**: Users can provide feedback to improve AI decisions
- **User-Friendly Dashboard**: View alert statistics, patterns, and manage settings

## System Architecture

The application consists of:

1. **Backend Server**: Node.js/Express application that:
   - Receives webhook notifications from Prometheus Alert Manager
   - Processes alerts using AI
   - Stores alert data in MongoDB
   - Communicates with LLM API (OpenAI)

2. **Frontend Dashboard**: React application with:
   - Alert overview and statistics
   - Alert history with filtering
   - Detailed alert view with feedback mechanism
   - AI prediction patterns
   - System settings

3. **Integration with Kubernetes**:
   - Deployed in the same cluster as Prometheus
   - Configured as a webhook receiver in Alert Manager

## Setup Instructions

### Prerequisites

- Kubernetes cluster with Prometheus and Alert Manager
- MongoDB instance
- OpenAI API key
- Slack webhook URL (for notifications)

### Deployment Steps

1. **Clone the repository**:
   ```bash
   git clone https://github.com/yourusername/ai-alert-manager.git
   cd ai-alert-manager
   ```

2. **Create a Kubernetes secret**:
   ```bash
   kubectl create secret generic ai-alert-manager-secrets \
     --from-literal=mongodb-uri="mongodb://user:pass@mongodb:27017/alerts" \
     --from-literal=openai-api-key="your-openai-api-key" \
     --from-literal=slack-webhook-url="your-slack-webhook-url" \
     --namespace monitoring
   ```

3. **Build and push the Docker image**:
   ```bash
   docker build -t yourusername/ai-alert-manager:latest .
   docker push yourusername/ai-alert-manager:latest
   ```

4. **Deploy to Kubernetes**:
   ```bash
   kubectl apply -f kubernetes/deployment.yaml
   kubectl apply -f kubernetes/service.yaml
   ```

5. **Configure Alert Manager**:
   ```bash
   kubectl apply -f kubernetes/alertmanager-config.yaml
   ```

6. **Access the dashboard**:
   ```bash
   kubectl port-forward service/ai-alert-manager 3000:3000 -n monitoring
   ```
   Then open http://localhost:3000 in your browser.

## Usage

### Alert Processing Flow

1. An alert fires in Prometheus
2. Alert Manager sends the alert to the AI Alert Manager webhook
3. The application:
   - Analyzes the alert using historical data
   - Determines whether to silence or forward based on patterns
   - Enriches the alert with AI-generated context
   - Stores the alert in the database
   - Sends a notification to Slack if not silenced

### Dashboard

- **Dashboard**: View overall statistics and recent alerts
- **Alerts**: Browse all alerts with filtering options
- **Alert Detail**: View detailed information about an alert and provide feedback
- **Predictions**: See AI-identified patterns and predicted behaviors
- **Settings**: Configure system behavior, AI settings, and notification preferences

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.