# Shared Voices

A web-based news and media platform designed to inform, inspire, and empower global audiences on topics such as Sustainable Development Goals (SDGs), innovation, humanitarian practices, and peace.

## Tech Stack

- **Frontend**: React.js with TypeScript, Tailwind CSS, Vite
- **Backend**: Node.js with Express.js (Microservices)
- **Databases**: MongoDB (content), PostgreSQL (users)
- **Search**: Elasticsearch
- **Caching**: Redis
- **Containerization**: Docker
- **CI/CD**: GitHub Actions

## Prerequisites

- Node.js >= 18.0.0
- Docker and Docker Compose
- Git

## Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/Atlas00000/sharevoices.git
   cd sharevoices
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development environment:
   ```bash
   docker-compose up -d
   ```

4. Start the development servers:
   ```bash
   npm run dev
   ```

The application will be available at:
- Frontend: http://localhost:3000
- Content Service: http://localhost:4001
- User Service: http://localhost:4002

## Development Workflow

1. **Branch Strategy**:
   - `main`: Production-ready code
   - `develop`: Integration branch for features
   - Feature branches: `feature/feature-name`
   - Bug fixes: `fix/bug-name`

2. **Code Style**:
   - ESLint for code linting
   - Prettier for code formatting
   - TypeScript for type safety

3. **Testing**:
   - Jest for unit testing
   - Cypress for E2E testing
   - Run tests: `npm test`

4. **Building**:
   - Development: `npm run dev`
   - Production: `npm run build`

## Project Structure

```
sharedvoices/
├── client/                # React.js frontend
├── server/               # Node.js backend
│   └── services/        # Microservices
├── db/                  # Database files
├── config/             # Configuration files
├── docs/              # Documentation
├── scripts/          # Utility scripts
└── tests/           # Test files
```

## Contributing

1. Create a feature branch
2. Make your changes
3. Run tests and linting
4. Submit a pull request

## License

MIT License - see LICENSE file for details 