# Shared Voices API Testing Guide

## Table of Contents
1. [Environment Setup](#environment-setup)
2. [Postman Collection Setup](#postman-collection-setup)
3. [API Endpoints Testing](#api-endpoints-testing)
4. [Authentication Flow](#authentication-flow)
5. [Role-Based Testing](#role-based-testing)
6. [Common Issues & Solutions](#common-issues--solutions)
7. [Testing Checklist](#testing-checklist)

## Environment Setup

### Docker Environment
```bash
# Start the services
docker-compose up --build

# Check container status
docker-compose ps

# View logs
docker-compose logs -f server
docker-compose logs -f mongodb
```

### Environment Variables
Required variables in `.env`:
```
PORT=4000
NODE_ENV=development
MONGODB_URI=mongodb://mongodb:27017/sharedvoices
JWT_SECRET=your-secure-jwt-secret
```

## Postman Collection Setup

### Environment Variables
Create a new environment in Postman:
- `base_url`: http://localhost:4000
- `token`: (leave empty, will be set after login)

### Collection Structure
1. **Health Check**
   - GET {{base_url}}/health

2. **Authentication**
   - POST {{base_url}}/api/auth/register
   - POST {{base_url}}/api/auth/login
   - GET {{base_url}}/api/auth/profile

3. **Articles**
   - GET {{base_url}}/api/articles
   - GET {{base_url}}/api/articles/:id
   - POST {{base_url}}/api/articles
   - PUT {{base_url}}/api/articles/:id
   - DELETE {{base_url}}/api/articles/:id

## API Endpoints Testing

### 1. Health Check
```http
GET http://localhost:4000/health
```
Expected Response:
```json
{
    "status": "ok"
}
```

### 2. User Registration
```http
POST http://localhost:4000/api/auth/register
Content-Type: application/json

{
    "email": "test@example.com",
    "password": "Test123!",
    "name": "Test User"
}
```
Expected Response:
```json
{
    "success": true,
    "data": {
        "user": {
            "id": "...",
            "email": "test@example.com",
            "name": "Test User",
            "role": "READER"
        },
        "token": "..."
    }
}
```

### 3. User Login
```http
POST http://localhost:4000/api/auth/login
Content-Type: application/json

{
    "email": "test@example.com",
    "password": "Test123!"
}
```

### 4. Create Article
```http
POST http://localhost:4000/api/articles
Authorization: Bearer {{token}}
Content-Type: application/json

{
    "title": "Test Article",
    "content": "This is a test article",
    "category": "technology"
}
```

## Authentication Flow

### Test Script for Login
```javascript
// Tests tab in Postman
if (pm.response.code === 200) {
    var jsonData = pm.response.json();
    if (jsonData.token) {
        pm.environment.set("token", jsonData.token);
    }
}
```

### Test Script for Profile
```javascript
// Tests tab in Postman
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Response has user data", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.user).to.have.property('email');
    pm.expect(jsonData.user).to.have.property('name');
});
```

## Role-Based Testing

### Admin User
```json
{
    "email": "admin@example.com",
    "password": "Admin123!",
    "name": "Admin User",
    "role": "ADMIN"
}
```

### Author User
```json
{
    "email": "author@example.com",
    "password": "Author123!",
    "name": "Author User",
    "role": "AUTHOR"
}
```

### Reader User
```json
{
    "email": "reader@example.com",
    "password": "Reader123!",
    "name": "Reader User",
    "role": "READER"
}
```

## Common Issues & Solutions

### 1. Docker Container Issues
**Problem:** Server container exits immediately
**Solution:**
- Check if using correct entry point (server.ts)
- Verify environment variables
- Check Docker logs

### 2. MongoDB Connection Issues
**Problem:** Can't connect to database
**Solution:**
- Verify MongoDB URI
- Check if MongoDB container is running
- Ensure network configuration is correct

### 3. Authentication Issues
**Problem:** Invalid token or unauthorized access
**Solution:**
- Verify JWT_SECRET is set
- Check token expiration
- Ensure correct role permissions

### 4. PowerShell Command Issues
**Problem:** Command chaining not working
**Solution:**
Use `;` instead of `&&`:
```powershell
docker-compose down; docker-compose up --build
```

## Testing Checklist

### Basic Setup
- [ ] Docker containers running
- [ ] Environment variables configured
- [ ] MongoDB connected
- [ ] Health check endpoint responding

### Authentication
- [ ] User registration working
- [ ] Login successful
- [ ] Token received and stored
- [ ] Profile endpoint accessible

### Articles
- [ ] Create article (authorized)
- [ ] Read article
- [ ] Update article (authorized)
- [ ] Delete article (authorized)
- [ ] Search functionality
- [ ] Pagination working

### Role Testing
- [ ] Admin can perform all operations
- [ ] Author can create/update own articles
- [ ] Reader can only read articles

### Error Handling
- [ ] Invalid credentials handled
- [ ] Missing fields validated
- [ ] Unauthorized access blocked
- [ ] Invalid IDs handled

## Best Practices

1. **Testing Order**
   - Start with health check
   - Test authentication flow
   - Test public endpoints
   - Test protected endpoints

2. **Data Management**
   - Use unique test data
   - Clean up test data after testing
   - Use appropriate test categories

3. **Security Testing**
   - Test with invalid tokens
   - Test with expired tokens
   - Test role-based access
   - Test input validation

4. **Performance Testing**
   - Test with pagination
   - Test search functionality
   - Monitor response times
   - Check error handling 