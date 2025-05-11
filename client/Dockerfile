# Stage 1: Build
FROM node:18-alpine AS builder

# Set workdir to root of monorepo
WORKDIR /app

# Copy root package files
COPY ../../package.json ../../package-lock.json ./

# Copy workspace (client) package.json
COPY ./package.json ./client/

# Copy all workspace files (for build)
COPY . ./client

# Install dependencies for all workspaces
RUN npm install

# Build the client app
WORKDIR /app/client
RUN npm run build

# Stage 2: Runtime
FROM node:18-alpine AS runner
WORKDIR /app

# Copy only the built client app and necessary files
COPY --from=builder /app/client/.next ./.next
COPY --from=builder /app/client/public ./public
COPY --from=builder /app/client/package.json ./
COPY --from=builder /app/package-lock.json ./
COPY --from=builder /app/client/next.config.js ./
COPY --from=builder /app/client/tailwind.config.js ./
COPY --from=builder /app/client/postcss.config.js ./
COPY --from=builder /app/client/tsconfig.json ./

RUN npm install --omit=dev

EXPOSE 3000
CMD ["npm", "start"] 