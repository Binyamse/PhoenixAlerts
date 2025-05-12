# phoenix-alerts

![Version: 0.1.0](https://img.shields.io/badge/Version-0.1.0-informational?style=flat-square) ![Type: application](https://img.shields.io/badge/Type-application-informational?style=flat-square) ![AppVersion: 1.0.0](https://img.shields.io/badge/AppVersion-1.0.0-informational?style=flat-square)

AI-powered alert management system for Kubernetes

**Homepage:** <https://github.com/Binyamse/PhoenixAlerts>

## Maintainers

| Name | Email | Url |
| ---- | ------ | --- |
| Binyamse |  | <https://github.com/Binyamse> |

## Source Code

* <https://github.com/Binyamse/PhoenixAlerts>

## Requirements

| Repository | Name | Version |
|------------|------|---------|
| https://charts.bitnami.com/bitnami | mongodb | 13.x.x |

## Values

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| alertManager.config | string | `"receivers:\n  - name: 'phoenix-alerts'\n    webhook_configs:\n    - url: 'http://phoenix-alerts-backend:3000/api/alerts'\n      send_resolved: true"` | Configuration for Alertmanager, specifying receivers and webhook settings. |
| alertManager.webhook.endpoint | string | `"/api/alerts"` | The endpoint for receiving alerts from Alertmanager. |
| autoscaling.enabled | bool | `false` | Enables or disables horizontal pod autoscaling. |
| autoscaling.maxReplicas | int | `5` | The maximum number of replicas for autoscaling. |
| autoscaling.minReplicas | int | `1` | The minimum number of replicas for autoscaling. |
| autoscaling.targetCPUUtilizationPercentage | int | `80` | Target CPU utilization percentage for triggering autoscaling. |
| autoscaling.targetMemoryUtilizationPercentage | int | `80` | Target memory utilization percentage for triggering autoscaling. |
| backend.config.logLevel | string | `"info"` | Logging level for the backend service (e.g., info, debug, error). |
| backend.config.port | int | `3000` | The port on which the backend service listens. |
| backend.image.pullPolicy | string | `"IfNotPresent"` | Image pull policy for the backend container. |
| backend.image.repository | string | `"ghcr.io/binyamse/phoenixalerts/backend"` | Repository for the backend container image. |
| backend.image.tag | string | `"latest"` | Tag for the backend container image. |
| backend.resources.limits.cpu | string | `"500m"` | Maximum CPU resources allocated to the backend container. |
| backend.resources.limits.memory | string | `"512Mi"` | Maximum memory resources allocated to the backend container. |
| backend.resources.requests.cpu | string | `"250m"` | Minimum CPU resources requested by the backend container. |
| backend.resources.requests.memory | string | `"256Mi"` | Minimum memory resources requested by the backend container. |
| backend.securityContext.fsGroup | int | `1000` | Filesystem group ID for the backend container. |
| backend.securityContext.runAsNonRoot | bool | `true` | Ensures the backend container runs as a non-root user. |
| backend.securityContext.runAsUser | int | `1000` | User ID for running the backend container. |
| externalMongodb.uri | string | `""` | URI for connecting to an external MongoDB instance. |
| frontend.config.apiBaseUrl | string | `"/api"` | Base URL for the frontend to communicate with the backend API. |
| frontend.config.port | int | `80` | The port on which the frontend service listens. |
| frontend.image.pullPolicy | string | `"IfNotPresent"` | Image pull policy for the frontend container. |
| frontend.image.repository | string | `"ghcr.io/binyamse/phoenixalerts/frontend"` | Repository for the frontend container image. |
| frontend.image.tag | string | `"latest"` | Tag for the frontend container image. |
| frontend.resources.limits.cpu | string | `"300m"` | Maximum CPU resources allocated to the frontend container. |
| frontend.resources.limits.memory | string | `"256Mi"` | Maximum memory resources allocated to the frontend container. |
| frontend.resources.requests.cpu | string | `"100m"` |  |
| frontend.resources.requests.memory | string | `"128Mi"` |  |
| frontend.securityContext.fsGroup | int | `1000` |  |
| frontend.securityContext.runAsNonRoot | bool | `true` |  |
| frontend.securityContext.runAsUser | int | `1000` |  |
| ingress.annotations."kubernetes.io/ingress.class" | string | `"nginx"` |  |
| ingress.annotations."nginx.ingress.kubernetes.io/ssl-redirect" | string | `"false"` |  |
| ingress.className | string | `"nginx"` |  |
| ingress.enabled | bool | `false` |  |
| ingress.hosts[0].host | string | `"phoenix-alerts.local"` |  |
| ingress.hosts[0].paths[0].path | string | `"/"` |  |
| ingress.hosts[0].paths[0].pathType | string | `"Prefix"` |  |
| ingress.hosts[0].paths[0].service | string | `"frontend"` |  |
| ingress.hosts[0].paths[1].path | string | `"/api"` |  |
| ingress.hosts[0].paths[1].pathType | string | `"Prefix"` |  |
| ingress.hosts[0].paths[1].service | string | `"backend"` |  |
| ingress.tls | list | `[]` |  |
| llm.models.anthropic.available[0] | string | `"claude-3-opus"` |  |
| llm.models.anthropic.available[1] | string | `"claude-3-sonnet"` |  |
| llm.models.anthropic.available[2] | string | `"claude-3-haiku"` |  |
| llm.models.anthropic.default | string | `"claude-3-haiku"` |  |
| llm.models.azure.available[0] | string | `"gpt-4"` |  |
| llm.models.azure.available[1] | string | `"gpt-3.5-turbo"` |  |
| llm.models.azure.default | string | `"gpt-4"` |  |
| llm.models.huggingface.available[0] | string | `"mistralai/Mistral-7B-Instruct-v0.2"` |  |
| llm.models.huggingface.available[1] | string | `"meta-llama/Llama-2-7b-chat-hf"` |  |
| llm.models.huggingface.default | string | `"mistralai/Mistral-7B-Instruct-v0.2"` |  |
| llm.models.ollama.available[0] | string | `"llama2"` |  |
| llm.models.ollama.available[1] | string | `"mistral"` |  |
| llm.models.ollama.available[2] | string | `"llama3"` |  |
| llm.models.ollama.available[3] | string | `"gemma"` |  |
| llm.models.ollama.available[4] | string | `"wizardlm"` |  |
| llm.models.ollama.default | string | `"llama2"` |  |
| llm.models.openai.available[0] | string | `"gpt-4"` |  |
| llm.models.openai.available[1] | string | `"gpt-3.5-turbo"` |  |
| llm.models.openai.available[2] | string | `"gpt-4-turbo"` |  |
| llm.models.openai.default | string | `"gpt-4"` |  |
| llm.provider | string | `"openai"` |  |
| llm.selectedModel | string | `""` |  |
| mongodb.architecture | string | `"standalone"` |  |
| mongodb.auth.database | string | `"alerts"` |  |
| mongodb.auth.password | string | `""` |  |
| mongodb.auth.rootPassword | string | `""` |  |
| mongodb.auth.username | string | `"phoenix"` |  |
| mongodb.enabled | bool | `true` |  |
| mongodb.persistence.enabled | bool | `true` |  |
| mongodb.persistence.size | string | `"8Gi"` |  |
| ollama.config.concurrency | int | `2` |  |
| ollama.config.gpu.enabled | bool | `false` |  |
| ollama.config.gpu.type | string | `"nvidia"` |  |
| ollama.enabled | bool | `false` |  |
| ollama.image.pullPolicy | string | `"IfNotPresent"` |  |
| ollama.image.repository | string | `"ollama/ollama"` |  |
| ollama.image.tag | string | `"latest"` |  |
| ollama.nodeSelector | object | `{}` |  |
| ollama.persistence.accessMode | string | `"ReadWriteOnce"` |  |
| ollama.persistence.enabled | bool | `true` |  |
| ollama.persistence.size | string | `"20Gi"` |  |
| ollama.persistence.storageClass | string | `""` |  |
| ollama.resources.limits.cpu | string | `"2000m"` |  |
| ollama.resources.limits.memory | string | `"8Gi"` |  |
| ollama.resources.requests.cpu | string | `"500m"` |  |
| ollama.resources.requests.memory | string | `"2Gi"` |  |
| ollama.securityContext.fsGroup | int | `1000` |  |
| ollama.securityContext.runAsNonRoot | bool | `true` |  |
| ollama.securityContext.runAsUser | int | `1000` |  |
| ollama.service.port | int | `11434` |  |
| ollama.service.type | string | `"ClusterIP"` |  |
| ollama.tolerations | list | `[]` |  |
| podDisruptionBudget.enabled | bool | `false` |  |
| podDisruptionBudget.minAvailable | int | `1` |  |
| prometheus.serviceMonitor.enabled | bool | `false` |  |
| prometheus.serviceMonitor.interval | string | `"30s"` |  |
| prometheus.serviceMonitor.labels | object | `{}` |  |
| prometheus.serviceMonitor.namespace | string | `"monitoring"` |  |
| prometheus.serviceMonitor.scrapeTimeout | string | `"10s"` |  |
| replicaCount | int | `1` |  |
| secrets.existingSecrets.anthropic | string | `""` |  |
| secrets.existingSecrets.azureOpenAi | string | `""` |  |
| secrets.existingSecrets.huggingFace | string | `""` |  |
| secrets.existingSecrets.mongodb | string | `""` |  |
| secrets.existingSecrets.openAi | string | `""` |  |
| secrets.existingSecrets.slack | string | `""` |  |
| secrets.secretValues.anthropicApiKey | string | `""` |  |
| secrets.secretValues.azureOpenAiApiKey | string | `""` |  |
| secrets.secretValues.azureOpenAiEndpoint | string | `""` |  |
| secrets.secretValues.huggingfaceApiKey | string | `""` |  |
| secrets.secretValues.mongodbUri | string | `""` |  |
| secrets.secretValues.openAiApiKey | string | `""` |  |
| secrets.secretValues.slackWebhookUrl | string | `""` |  |
| secrets.useExisting | bool | `false` |  |
| service.backend.port | int | `3000` |  |
| service.backend.type | string | `"ClusterIP"` |  |
| service.frontend.port | int | `80` |  |
| service.frontend.type | string | `"ClusterIP"` |  |

----------------------------------------------
Autogenerated from chart metadata using [helm-docs v1.14.2](https://github.com/norwoodj/helm-docs/releases/v1.14.2)
