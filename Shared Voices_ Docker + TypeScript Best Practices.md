# **Shared Voices: Docker \+ TypeScript Best Practices**

A streamlined guide to avoid TypeScript errors and ensure a robust Docker setup for Shared Voices.

---

## **1\. Multi-Stage Docker Build**

\# Stage 1: build  
FROM node:18-alpine AS builder  
WORKDIR /usr/src/app

COPY package\*.json ./  
RUN npm ci  
COPY tsconfig.json ./tsconfig.json  
COPY src ./src  
RUN npm run build

\# Stage 2: runtime  
FROM node:18-alpine AS runner  
WORKDIR /usr/src/app

COPY package\*.json ./  
RUN npm ci \--omit=dev  
COPY \--from=builder /usr/src/app/dist ./dist

CMD \["node", "dist/index.js"\]

* **Build-time checks**: TS errors fail the image build.

* **Lean runtime**: No dev deps in the final image.

---

## **2\. Strict `tsconfig.json`**

{  
  "compilerOptions": {  
    "target": "ES2020",  
    "module": "commonjs",  
    "rootDir": "src",  
    "outDir": "dist",  
    "strict": true,  
    "noImplicitAny": true,  
    "strictNullChecks": true,  
    "esModuleInterop": true,  
    "skipLibCheck": true,  
    "forceConsistentCasingInFileNames": true  
  },  
  "include": \["src/\*\*/\*"\]  
}

* **`rootDir`/`outDir`** keep build inputs/outputs clear.

* **`strict`** catches type mismatches early.

---

## **3\. `.dockerignore`**

node\_modules  
dist  
.git  
.vscode  
.env

* **Smaller context**: speeds up builds.

* **Avoid leaks**: prevents local files from entering images.

---

## **4\. Dev Workflow with Docker Compose**

version: '3.8'  
services:  
  api:  
    build:  
      context: .  
      target: builder  
    volumes:  
      \- .:/usr/src/app  
      \- /usr/src/app/node\_modules  
    command: sh \-c "npm run dev"  
    ports:  
      \- "4000:4000"

// package.json scripts  
{  
  "scripts": {  
    "build": "tsc",  
    "start": "node dist/index.js",  
    "dev": "ts-node-dev \--respawn \--transpile-only src/index.ts"  
  }  
}

* **Live reload**: mount source code.

* **Consistent deps**: container’s node\_modules match Linux.

---

## **5\. Enforce Type Safety**

**ESLint**

 {  
  "extends": \["eslint:recommended", "plugin:@typescript-eslint/recommended"\],  
  "parser": "@typescript-eslint/parser",  
  "plugins": \["@typescript-eslint"\],  
  "rules": {  
    "@typescript-eslint/no-explicit-any": "error",  
    "@typescript-eslint/strict-boolean-expressions": "error"  
  }  
}

1. 

**Schema Validation** (Zod)

 import { z } from "zod";

const ArticleSchema \= z.object({  
  title: z.string(),  
  content: z.string(),  
  tags: z.array(z.string()).optional(),  
});

const article \= ArticleSchema.parse(req.body);

2.   
* **Lint in CI**: catch issues before build.

* **Validate inputs**: prevent runtime type errors.

---

## **6\. Health Checks & CI Integration**

HEALTHCHECK \--interval=30s \--timeout=5s \\  
  CMD node dist/healthcheck.js || exit 1

\# .github/workflows/ci.yml  
jobs:  
  build:  
    runs-on: ubuntu-latest  
    steps:  
      \- uses: actions/checkout@v3  
      \- run: npm ci && npm run lint  
      \- run: npm run build  
      \- run: docker build \--target runner \-t shared-voices-api .

* **Automated failure**: pipelines stop on lint/build errors.

* **Container health**: Kubernetes/Docker can restart unhealthy pods.

---

By applying these steps, your Dockerized services will be lean, type-safe, and CI-ready—minimizing runtime errors and speeding up development.

