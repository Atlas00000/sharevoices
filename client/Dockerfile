# Stage 1: Build
FROM node:18-alpine AS builder

WORKDIR /app

# Copy root package files
COPY package.json package-lock.json ./

# Copy workspace (client) package.json
COPY client/package.json ./client/

# Copy all workspace files (for build)
COPY client ./client

# Install dependencies for all workspaces
RUN npm install

# Build the client app
WORKDIR /app/client
RUN npm run build

# Stage 2: Runtime
FROM node:18-alpine AS runner
WORKDIR /app

# Copy built files
COPY --from=builder /app/client/.next ./.next
COPY --from=builder /app/client/public ./public

# Copy source files
COPY --from=builder /app/client/src ./src
COPY --from=builder /app/client/package.json ./
COPY --from=builder /app/package-lock.json ./
COPY --from=builder /app/client/next.config.js ./
COPY --from=builder /app/client/tailwind.config.js ./
COPY --from=builder /app/client/postcss.config.js ./
COPY --from=builder /app/client/tsconfig.json ./

RUN npm install --omit=dev

EXPOSE 3000
CMD ["npm", "start"] 