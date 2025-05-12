# Build stage
FROM node:18-alpine AS build

WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage using Nginx
FROM nginx:1.25-alpine

# Copy Nginx configuration
COPY nginx/default.conf /etc/nginx/conf.d/default.conf

# Copy built application from build stage
COPY --from=build /app/build /usr/share/nginx/html

# Add health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
    CMD wget -q -O - http://localhost:80/health || exit 1

# Create non-root user
RUN addgroup -g 1001 nginx_group && \
    adduser -S -u 1001 -G nginx_group nginx_user && \
    mkdir -p /var/cache/nginx/client_temp /var/cache/nginx/proxy_temp && \
    chown -R nginx_user:nginx_group /usr/share/nginx/html && \
    chown -R nginx_user:nginx_group /var/cache/nginx && \
    chown -R nginx_user:nginx_group /var/log/nginx && \
    touch /var/run/nginx.pid && \
    chown -R nginx_user:nginx_group /var/run/nginx.pid

# Update nginx config to run as non-root
RUN sed -i 's/user  nginx;/user  nginx_user;/' /etc/nginx/nginx.conf

# Switch to non-root user
USER nginx_user

# Expose port
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]