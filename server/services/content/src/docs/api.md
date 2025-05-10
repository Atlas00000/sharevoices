# Content Service API Documentation

## Overview
The Content Service provides endpoints for managing articles, including CRUD operations, versioning, and statistics. All endpoints are prefixed with `/api/content`.

## Authentication
Most endpoints require authentication using JWT tokens. Include the token in the Authorization header:
```
Authorization: Bearer <your-token>
```

## Endpoints

### Articles

#### Get All Articles
```http
GET /api/content
```

Query Parameters:
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `category` (optional): Filter by category
- `status` (optional): Filter by status (draft, published, archived)
- `authorId` (optional): Filter by author
- `search` (optional): Search in title and content

Response:
```json
{
    "articles": [
        {
            "id": "string",
            "title": "string",
            "content": "string",
            "slug": "string",
            "category": "string",
            "tags": ["string"],
            "authorId": "string",
            "status": "string",
            "viewCount": "number",
            "likeCount": "number",
            "commentCount": "number",
            "createdAt": "date",
            "updatedAt": "date",
            "publishedAt": "date"
        }
    ],
    "total": "number",
    "page": "number",
    "totalPages": "number"
}
```

#### Get Article by ID
```http
GET /api/content/:id
```

Response:
```json
{
    "id": "string",
    "title": "string",
    "content": "string",
    "slug": "string",
    "category": "string",
    "tags": ["string"],
    "authorId": "string",
    "status": "string",
    "viewCount": "number",
    "likeCount": "number",
    "commentCount": "number",
    "createdAt": "date",
    "updatedAt": "date",
    "publishedAt": "date"
}
```

#### Create Article
```http
POST /api/content
```

Request Body:
```json
{
    "title": "string",
    "content": "string",
    "category": "string",
    "tags": ["string"],
    "authorId": "string",
    "featuredImage": "string",
    "mediaUrls": ["string"]
}
```

#### Update Article
```http
PUT /api/content/:id
```

Request Body:
```json
{
    "title": "string",
    "content": "string",
    "category": "string",
    "tags": ["string"],
    "status": "string",
    "featuredImage": "string",
    "mediaUrls": ["string"]
}
```

#### Delete Article
```http
DELETE /api/content/:id
```

#### Publish Article
```http
POST /api/content/:id/publish
```

### Versioning

#### Get Article Versions
```http
GET /api/content/:id/versions
```

Response:
```json
[
    {
        "version": "number",
        "title": "string",
        "content": "string",
        "category": "string",
        "tags": ["string"],
        "changes": [
            {
                "field": "string",
                "oldValue": "any",
                "newValue": "any"
            }
        ],
        "createdAt": "date",
        "createdBy": "string"
    }
]
```

#### Get Specific Version
```http
GET /api/content/:id/versions/:version
```

#### Restore to Version
```http
POST /api/content/:id/versions/:version/restore
```

### Statistics

#### Get Article Statistics
```http
GET /api/content/:id/stats
```

Response:
```json
{
    "totalViews": "number",
    "totalLikes": "number",
    "totalComments": "number",
    "versionCount": "number",
    "lastUpdated": "date",
    "lastPublished": "date",
    "averageViewsPerDay": "number",
    "engagementRate": "number",
    "versionHistory": [
        {
            "version": "number",
            "createdAt": "date",
            "changes": "number"
        }
    ]
}
```

#### Get Global Statistics
```http
GET /api/content/stats/global
```

Response:
```json
{
    "totalArticles": "number",
    "publishedArticles": "number",
    "totalViews": "number",
    "totalLikes": "number",
    "totalComments": "number",
    "categoryStats": [
        {
            "_id": "string",
            "count": "number"
        }
    ],
    "authorStats": [
        {
            "_id": "string",
            "count": "number"
        }
    ]
}
```

## Error Responses

All endpoints may return the following error responses:

```json
{
    "message": "string",
    "errors": [
        {
            "field": "string",
            "message": "string"
        }
    ]
}
```

Status Codes:
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Internal Server Error

## Rate Limiting

The API implements rate limiting:
- 100 requests per 15 minutes per IP address
- Rate limit headers are included in responses:
  - `X-RateLimit-Limit`: Maximum requests per window
  - `X-RateLimit-Remaining`: Remaining requests in current window
  - `X-RateLimit-Reset`: Time when the rate limit resets

## Caching

The API implements caching for:
- Article listings (1 hour)
- Individual articles (1 hour)
- Statistics (5 minutes)

Cache invalidation occurs on:
- Article updates
- Article deletion
- Article publishing

## Best Practices

1. Use pagination for large result sets
2. Implement proper error handling
3. Cache responses when appropriate
4. Use appropriate HTTP methods
5. Include proper authentication headers
6. Handle rate limiting gracefully 