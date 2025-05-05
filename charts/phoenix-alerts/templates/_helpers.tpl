{{/*
Expand the name of the chart.
*/}}
{{- define "phoenix-alerts.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Create a default fully qualified app name.
We truncate at 63 chars because some Kubernetes name fields are limited to this (by the DNS naming spec).
If release name contains chart name it will be used as a full name.
*/}}
{{- define "phoenix-alerts.fullname" -}}
{{- if .Values.fullnameOverride }}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- $name := default .Chart.Name .Values.nameOverride }}
{{- if contains $name .Release.Name }}
{{- .Release.Name | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" }}
{{- end }}
{{- end }}
{{- end }}

{{/*
Create chart name and version as used by the chart label.
*/}}
{{- define "phoenix-alerts.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Common labels
*/}}
{{- define "phoenix-alerts.labels" -}}
helm.sh/chart: {{ include "phoenix-alerts.chart" . }}
{{ include "phoenix-alerts.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}

{{/*
Selector labels
*/}}
{{- define "phoenix-alerts.selectorLabels" -}}
app.kubernetes.io/name: {{ include "phoenix-alerts.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}

{{/*
Create the name of the service account to use
*/}}
{{- define "phoenix-alerts.serviceAccountName" -}}
{{- if .Values.serviceAccount.create }}
{{- default (include "phoenix-alerts.fullname" .) .Values.serviceAccount.name }}
{{- else }}
{{- default "default" .Values.serviceAccount.name }}
{{- end }}
{{- end }}

{{/*
Get the MongoDB URI
*/}}
{{- define "phoenix-alerts.mongodbUri" -}}
{{- if .Values.mongodb.enabled }}
{{- $mongodbServiceName := printf "%s-mongodb" (include "phoenix-alerts.fullname" .) }}
{{- $mongodbPort := 27017 | int }}
{{- $mongodbDatabase := .Values.mongodb.auth.database }}
{{- $mongodbUsername := .Values.mongodb.auth.username }}
{{- $mongodbPassword := .Values.mongodb.auth.password }}
{{- printf "mongodb://%s:%s@%s:%d/%s" $mongodbUsername $mongodbPassword $mongodbServiceName $mongodbPort $mongodbDatabase }}
{{- else }}
{{- .Values.externalMongodb.uri }}
{{- end }}
{{- end }}