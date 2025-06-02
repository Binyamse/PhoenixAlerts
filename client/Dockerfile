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

# Create ALL required nginx cache directories with proper permissions
RUN mkdir -p /var/cache/nginx/client_temp \
    /var/cache/nginx/proxy_temp \
    /var/cache/nginx/fastcgi_temp \
    /var/cache/nginx/uwsgi_temp \
    /var/cache/nginx/scgi_temp && \
    chmod -R 755 /var/cache/nginx

# Create nginx run directory
RUN mkdir -p /var/run/nginx && \
    chmod 755 /var/run/nginx

# Create non-root user and set permissions
RUN addgroup -g 1001 nginx_group && \
    adduser -S -u 1001 -G nginx_group nginx_user && \
    chown -R nginx_user:nginx_group /usr/share/nginx/html && \
    chown -R nginx_user:nginx_group /var/cache/nginx && \
    chown -R nginx_user:nginx_group /var/log/nginx && \
    chown -R nginx_user:nginx_group /var/run/nginx && \
    touch /var/run/nginx.pid && \
    chown nginx_user:nginx_group /var/run/nginx.pid

# Update nginx config to run as non-root
RUN sed -i 's/user  nginx;/user  nginx_user;/' /etc/nginx/nginx.conf

# Switch to non-root user
USER nginx_user

# Expose port
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]