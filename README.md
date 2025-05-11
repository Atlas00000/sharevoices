# Shared Voices Platform

## Overview
Shared Voices is a platform for sharing and managing articles. This project includes a Node.js/Express backend with MongoDB and automated tests.

## Feature Priority Table

### Phase 1: Core Features (High Priority)
| Feature | Priority | Complexity | Dependencies | Description |
|---------|----------|------------|--------------|-------------|
| User Authentication | Critical | Medium | None | JWT-based auth, user registration/login |
| Role-Based Access | Critical | Medium | Auth | Admin, Author, Reader roles |
| Article Search | High | Low | None | Basic search by title/content |
| Pagination | High | Low | None | Limit results per page |

### Phase 2: Essential Enhancements (Medium Priority)
| Feature | Priority | Complexity | Dependencies | Description |
|---------|----------|------------|--------------|-------------|
| Comments System | High | Medium | Auth | Article comments with CRUD |
| Categories Management | Medium | Low | None | CRUD for article categories |
| Tags System | Medium | Low | None | Article tagging functionality |
| Request Validation | Medium | Low | None | Input validation middleware |

### Phase 3: Advanced Features (Lower Priority)
| Feature | Priority | Complexity | Dependencies | Description |
|---------|----------|------------|--------------|-------------|
| Like/Dislike | Medium | Low | Auth | Article rating system |
| Media Upload | Medium | High | Auth | Image upload for articles |
| Rich Text Editor | Medium | High | None | WYSIWYG editor support |
| API Documentation | Low | Low | None | Swagger/OpenAPI docs |

### Phase 4: Performance & Security (Ongoing)
| Feature | Priority | Complexity | Dependencies | Description |
|---------|----------|------------|--------------|-------------|
| Rate Limiting | High | Low | None | API request limiting |
| Caching | Medium | Medium | None | Response caching |
| Security Headers | High | Low | None | Enhanced security measures |
| Error Logging | Medium | Low | None | Centralized error tracking |

## Project Structure
- `server/`: Backend code
  - `src/`: Source files
    - `index.ts`: Express app setup
    - `server.ts`: Server entry point
    - `routes/`: API routes
    - `controllers/`: Route handlers
    - `models/`: Mongoose models
  - `tests/`: Automated tests
  - `package.json`: Dependencies and scripts
  - `tsconfig.json`: TypeScript configuration
  - `Dockerfile`: Docker configuration
- `docker-compose.yml`: Docker Compose configuration
- `.env`: Environment variables (not committed)
- `.env.example`: Example environment variables

## API Endpoints
### Articles
- `GET /api/articles`: Get all articles
- `GET /api/articles/:id`: Get a specific article
- `POST /api/articles`: Create a new article
  - Required fields: `title`, `content`, `author`, `category`
- `PUT /api/articles/:id`: Update an article
  - Required fields: `title`, `content`, `author`, `category`
- `DELETE /api/articles/:id`: Delete an article

## Testing
### Setup
- Tests are written using Jest and Supertest.
- The test database is separate from the development/production database.
- Tests are located in `server/tests/`.

### Running Tests
```bash
cd server
npm test
```

### Test Coverage
- Tests cover all CRUD operations for articles.
- Each test ensures the correct status code and response body.

## Development
### Prerequisites
- Node.js
- MongoDB
- Docker (optional)

### Setup
1. Clone the repository.
2. Install dependencies:
   ```bash
   cd server
   npm install
   ```
3. Create a `.env` file in the `server` directory with the following variables:
   ```
   PORT=4000
   MONGODB_URI=mongodb://localhost:27017/sharedvoices
   NODE_ENV=development
   ```
4. Start the server:
   ```bash
   npm run dev
   ```

### Docker
To run the project using Docker:
```bash
docker-compose up --build
```

## License
MIT 