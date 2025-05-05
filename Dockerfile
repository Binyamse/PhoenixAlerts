# Build stage
FROM node:18-alpine AS build

WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build the application (if needed)
RUN npm run build

# Production stage
FROM node:18-alpine

# Set node environment to production
ENV NODE_ENV=production

# Create app directory
WORKDIR /app

# Install tini for proper signal handling
RUN apk add --no-cache tini

# Create non-root user
RUN addgroup -g 1001 nodejs && \
    adduser -S -u 1001 -G nodejs nodejs

# Copy from build stage
COPY --from=build --chown=nodejs:nodejs /app/models ./models
COPY --from=build --chown=nodejs:nodejs /app/services ./services
COPY --from=build --chown=nodejs:nodejs /app/routes ./routes
COPY --from=build --chown=nodejs:nodejs /app/config ./config
COPY --from=build --chown=nodejs:nodejs /app/middleware ./middleware
COPY --from=build --chown=nodejs:nodejs /app/scripts ./scripts
COPY --from=build --chown=nodejs:nodejs /app/server.js ./


# Set proper permissions
RUN chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Required environment variables
ENV PORT=3000
ENV LOG_LEVEL=info
# Other variables will be passed via Kubernetes secrets

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
    CMD wget -q -O - http://localhost:$PORT/health || exit 1

# Expose port
EXPOSE $PORT

# Run the application with tini for proper signal handling
ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "server.js"]