# Use multi-stage build with optimized caching
FROM node:18-alpine AS dependencies

WORKDIR /app

# Copy only package files first for better caching
COPY package*.json ./

# Install ALL dependencies (including dev) for build stage
RUN npm ci --include=dev

# Build stage
FROM node:18-alpine AS build

WORKDIR /app

# Copy dependencies from previous stage
COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=dependencies /app/package*.json ./

# Copy source code
COPY . .

# Build the application if needed
RUN npm run build 2>/dev/null || echo "No build script found, skipping..."

# Prune dev dependencies
RUN npm prune --omit=dev

# Production stage
FROM node:18-alpine AS production

# Set node environment to production
ENV NODE_ENV=production
ENV PORT=3000
ENV LOG_LEVEL=info

# Install tini for proper signal handling
RUN apk add --no-cache tini

# Create app directory
WORKDIR /app

# Create non-root user
RUN addgroup -g 1001 nodejs && \
    adduser -S -u 1001 -G nodejs nodejs

# Copy built application and production dependencies
COPY --from=build --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=build --chown=nodejs:nodejs /app/package*.json ./

# Copy application files with proper ownership
COPY --from=build --chown=nodejs:nodejs /app/models ./models
COPY --from=build --chown=nodejs:nodejs /app/services ./services
COPY --from=build --chown=nodejs:nodejs /app/routes ./routes
COPY --from=build --chown=nodejs:nodejs /app/config ./config
COPY --from=build --chown=nodejs:nodejs /app/middleware ./middleware
COPY --from=build --chown=nodejs:nodejs /app/scripts ./scripts
COPY --from=build --chown=nodejs:nodejs /app/server.js ./

# Switch to non-root user
USER nodejs

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
    CMD wget -q -O - http://localhost:$PORT/health || exit 1

# Expose port
EXPOSE $PORT

# Run the application with tini for proper signal handling
ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "server.js"]