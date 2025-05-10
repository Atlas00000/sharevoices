rocchyes
# Phase 2: Core Backend Development (Local First) Checklist

## 1. Monorepo & Project Structure
- [ ] Ensure the following folder structure exists:
  - `client/` (React frontend)
  - `server/services/content/` (Content microservice)
  - `server/services/user/` (User microservice)
  - `server/services/interaction/` (Interaction microservice)
  - `server/services/notification/` (Notification microservice)
  - `server/shared/` (Shared backend utilities)
  - `db/` (Schemas, migrations, seeds)
  - `config/` (Global configs)
  - `scripts/` (Automation scripts)
- [ ] Root-level `package.json` with workspaces for all subprojects

## 2. Backend Microservices Bootstrapping
- [ ] Scaffold each microservice with:
  - Express.js + TypeScript setup
  - Dockerfile for each service
  - Service-specific `package.json`
  - Basic health check endpoint (`/health`)
- [ ] Set up shared ESLint, Prettier, and TypeScript configs

## 3. Database Schemas & Migrations
- [ ] Define MongoDB schemas (e.g., Article, Media) in `db/schemas/mongodb/`
- [ ] Define PostgreSQL schemas (e.g., User, Role) in `db/schemas/postgresql/`
- [ ] Add migration scripts for both databases in `db/migrations/`
- [ ] Add seed data for local development in `db/seeds/`

## 4. Service Integration
- [ ] Connect Content Service to MongoDB
- [ ] Connect User Service to PostgreSQL
- [ ] Set up Redis and Elasticsearch integration as needed
- [ ] Implement basic CRUD endpoints for articles and users

## 5. Local API Gateway (Optional)
- [ ] Set up a simple API gateway (e.g., Express or Nginx) to route requests to microservices

## 6. Frontend Bootstrapping
- [ ] Scaffold React app in `client/` with Vite, Tailwind CSS, and TypeScript
- [ ] Set up basic routing (Home, Articles, Login)
- [ ] Connect frontend to backend APIs (using local endpoints)

## 7. Local Testing & Debugging
- [ ] Add unit tests for backend (Jest/Mocha)
- [ ] Add integration tests for API endpoints
- [ ] Set up VS Code debugging for backend and frontend

## 8. Documentation
- [ ] Update `README.md` with local setup instructions
- [ ] Document API endpoints in `docs/api.md`
- [ ] Add developer onboarding notes in `docs/setup.md`

---

### Bonus: Automation & Quality
- [ ] Add scripts for starting/stopping all services (`scripts/start-dev.ps1` or `.sh`)
- [ ] Set up Husky for pre-commit linting
- [ ] Add `.env.example` files for all services 