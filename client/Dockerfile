# Build stage
FROM node:18-alpine as builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Development stage
FROM node:18-alpine

WORKDIR /app

# Copy built files from builder
COPY --from=builder /app .

# Expose port
EXPOSE 3000

# Start development server
CMD ["npm", "run", "dev"] 