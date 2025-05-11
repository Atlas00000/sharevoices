# Testing and Debugging Guide for Shared Voices

## Table of Contents
1. [Docker Compose Issues](#docker-compose-issues)
2. [Server Startup Problems](#server-startup-problems)
3. [PowerShell Command Syntax](#powershell-command-syntax)
4. [Environment Configuration](#environment-configuration)
5. [API Testing](#api-testing)
6. [Common Error Patterns](#common-error-patterns)

## Docker Compose Issues

### Problem: Server Container Exits Immediately
**Symptoms:**
- Container starts but exits with code 0
- No error logs, only ts-node-dev startup message
- Health check endpoint unreachable

**Root Cause:**
- Wrong entry point in package.json (using `src/index.ts` instead of `src/server.ts`)
- Server process not staying alive (index.ts only exports app, doesn't start server)

**Solution:**
1. Update `package.json` dev script:
```json
{
  "scripts": {
    "dev": "ts-node-dev --respawn --transpile-only src/server.ts"
  }
}
```

2. Ensure server.ts contains the actual server startup code:
```typescript
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
```

### Problem: MongoDB Connection Issues
**Symptoms:**
- MongoDB container starts but server can't connect
- Connection timeout errors

**Solution:**
1. Use correct MongoDB URI in .env:
```
MONGODB_URI=mongodb://mongodb:27017/sharedvoices
```
2. Ensure MongoDB container is ready before server starts:
```yaml
depends_on:
  - mongodb
```

## Server Startup Problems

### Problem: TypeScript Path Aliases
**Symptoms:**
- Module not found errors for @sharedvoices imports
- Build failures in Docker

**Solution:**
1. Configure tsconfig.json paths:
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@sharedvoices/*": ["../shared/*"]
    }
  }
}
```

2. Update Dockerfile to handle path aliases:
```dockerfile
COPY tsconfig.json .
COPY shared/ ../shared/
```

## PowerShell Command Syntax

### Problem: Command Chaining
**Symptoms:**
- `&&` operator not working in PowerShell
- Command execution fails

**Solution:**
Use `;` instead of `&&` for command chaining in PowerShell:
```powershell
docker-compose down; docker-compose up --build
```

## Environment Configuration

### Problem: Missing Environment Variables
**Symptoms:**
- Server fails to start
- JWT authentication errors
- Database connection failures

**Solution:**
1. Create `.env` file with required variables:
```
PORT=4000
NODE_ENV=development
MONGODB_URI=mongodb://mongodb:27017/sharedvoices
JWT_SECRET=your-secure-jwt-secret
```

2. Ensure Docker Compose loads environment variables:
```yaml
environment:
  - NODE_ENV=development
  - MONGODB_URI=mongodb://mongodb:27017/sharedvoices
```

## API Testing

### Problem: Endpoint Testing Issues
**Symptoms:**
- curl commands failing
- PowerShell Invoke-RestMethod errors
- Connection closed unexpectedly

**Solution:**
1. Use browser for initial testing:
```
http://localhost:4000/health
http://localhost:4000/api/articles
```

2. For PowerShell, use proper syntax:
```powershell
Invoke-RestMethod -Uri "http://localhost:4000/health" -Method Get
```

3. For curl in PowerShell:
```powershell
curl.exe http://localhost:4000/health
```

## Common Error Patterns

### 1. Container Exit Code 0
**Meaning:** Process completed successfully but didn't stay running
**Fix:** Ensure server process is blocking (using app.listen)

### 2. Connection Refused
**Meaning:** Service not listening on expected port
**Fix:** Check port bindings and service startup

### 3. Module Not Found
**Meaning:** TypeScript path resolution issues
**Fix:** Configure paths in tsconfig.json and Dockerfile

### 4. Environment Variable Missing
**Meaning:** Required configuration not set
**Fix:** Check .env file and Docker Compose environment section

## Best Practices

1. **Logging:**
   - Use structured logging
   - Include timestamps and context
   - Log startup and shutdown events

2. **Error Handling:**
   - Implement proper error middleware
   - Use try-catch blocks
   - Return meaningful error messages

3. **Testing:**
   - Start with health check endpoint
   - Test each API endpoint
   - Verify database connections

4. **Debugging:**
   - Check container logs
   - Verify environment variables
   - Test endpoints in browser first

## Troubleshooting Checklist

1. [ ] Check container status: `docker-compose ps`
2. [ ] View container logs: `docker-compose logs server`
3. [ ] Verify environment variables
4. [ ] Test health check endpoint
5. [ ] Check MongoDB connection
6. [ ] Verify TypeScript compilation
7. [ ] Test API endpoints
8. [ ] Check file permissions
9. [ ] Verify network connectivity
10. [ ] Review error logs 