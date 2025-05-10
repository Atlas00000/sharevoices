# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy root package files for monorepo
COPY package*.json ./
COPY tsconfig*.json ./
COPY .eslintrc.json ./

# Copy gateway package.json
COPY server/gateway/package*.json ./server/gateway/

# Copy shared module package.json
COPY server/shared/package*.json ./server/shared/

# Install dependencies at the root level
RUN npm ci --prefer-offline --no-audit

# Copy the entire monorepo structure
COPY server ./server

# Build the shared module first
WORKDIR /app/server/shared
RUN npm run build

# Build the gateway
WORKDIR /app/server/gateway
RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Copy root package files
COPY package*.json ./

# Copy gateway package.json
COPY server/gateway/package*.json ./server/gateway/

# Copy shared module package.json
COPY server/shared/package*.json ./server/shared/

# Install production dependencies
RUN npm ci --prefer-offline --no-audit --omit=dev

# Copy built files from builder
COPY --from=builder /app/server/gateway/dist ./server/gateway/dist
COPY --from=builder /app/server/shared/dist ./server/shared/dist

# Copy entrypoint script
COPY server/gateway/docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Set environment variables
ENV NODE_ENV=production
ENV PORT=8080

# Expose port
EXPOSE 8080

# Set working directory to the gateway
WORKDIR /app/server/gateway

# Set entrypoint
ENTRYPOINT ["docker-entrypoint.sh"]
