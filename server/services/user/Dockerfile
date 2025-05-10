# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy root package files for monorepo
COPY package*.json ./
COPY tsconfig*.json ./
COPY .eslintrc.json ./

# Copy service package.json
COPY server/services/user/package*.json ./server/services/user/

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

# Build the user service
WORKDIR /app/server/services/user
RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Copy root package files
COPY package*.json ./

# Copy service package.json
COPY server/services/user/package*.json ./server/services/user/

# Copy shared module package.json
COPY server/shared/package*.json ./server/shared/

# Install production dependencies
RUN npm ci --prefer-offline --no-audit --omit=dev

# Copy built files from builder
COPY --from=builder /app/server/services/user/dist ./server/services/user/dist
COPY --from=builder /app/server/shared/dist ./server/shared/dist
COPY --from=builder /app/db ./db

# Copy entrypoint script
COPY server/services/user/docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Expose port
EXPOSE 3000

# Set working directory to the service
WORKDIR /app/server/services/user

# Set entrypoint
ENTRYPOINT ["docker-entrypoint.sh"]