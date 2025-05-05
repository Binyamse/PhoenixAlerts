# First stage: build
FROM node:18-alpine as builder

WORKDIR /app

# Copy package files and install dependencies
COPY package.json ./
RUN npm install
# Install authentication dependencies at build time
RUN npm install --save bcrypt jsonwebtoken

# Copy client package files and install dependencies
COPY client/package.json ./client/
RUN cd client && npm install

# Copy source code
COPY . .

# Build the React frontend
RUN cd client && npm run build

# Second stage: runtime
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package.json ./
RUN npm install --production

# Copy built frontend from builder stage
COPY --from=builder /app/client/build ./client/build

# Copy server files
COPY --from=builder /app/models ./models
COPY --from=builder /app/services ./services
COPY --from=builder /app/routes ./routes
COPY --from=builder /app/config ./config
COPY --from=builder /app/server.js ./

# Create middleware directory and copy auth middleware
RUN mkdir -p middleware
COPY --from=builder /app/middleware ./middleware

# Create scripts directory and copy admin creation script
RUN mkdir -p scripts
COPY --from=builder /app/scripts ./scripts

# Expose the port
EXPOSE 3000

# Start the application
CMD ["node", "server.js"]