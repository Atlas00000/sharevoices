# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy root package files for monorepo
COPY package*.json ./
COPY tsconfig*.json ./
COPY .eslintrc.json ./

# Copy service package.json
COPY server/services/interaction/package*.json ./server/services/interaction/

# Copy shared module package.json
COPY server/shared/package*.json ./server/shared/

# Create db directory
RUN mkdir -p ./db

# Install dependencies at the root level
RUN npm ci --prefer-offline --no-audit

# Copy the entire monorepo structure
COPY server ./server
COPY db ./db

# Build the shared module first
WORKDIR /app/server/shared
RUN npm run build

# Build the interaction service
WORKDIR /app/server/services/interaction
RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Copy root package files
COPY package*.json ./

# Copy service package.json
COPY server/services/interaction/package*.json ./server/services/interaction/

# Copy shared module package.json
COPY server/shared/package*.json ./server/shared/

# Install production dependencies
RUN npm ci --prefer-offline --no-audit --omit=dev

# Copy built files from builder
COPY --from=builder /app/server/services/interaction/dist ./server/services/interaction/dist
COPY --from=builder /app/server/shared/dist ./server/shared/dist
COPY --from=builder /app/db ./db

# Copy entrypoint script
COPY server/services/interaction/docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3003

# Expose port
EXPOSE 3003

# Set working directory to the service
WORKDIR /app/server/services/interaction

# Set entrypoint
ENTRYPOINT ["docker-entrypoint.sh"]