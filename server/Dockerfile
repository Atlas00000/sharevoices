# Stage 1: Build
FROM node:18-alpine AS builder
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY src/ ./src/

# Build TypeScript
RUN npm run build

# Stage 2: Runtime
FROM node:18-alpine AS runner
WORKDIR /usr/src/app

# Copy package files and install production dependencies
COPY package*.json ./
RUN npm install --omit=dev

# Copy built files from builder
COPY --from=builder /usr/src/app/dist ./dist

# Set environment variables
ENV NODE_ENV=production

# Expose port
EXPOSE 4000

# Start the server
CMD ["node", "dist/index.js"] 