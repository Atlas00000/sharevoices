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

2. Set up environment configuration:
   ```bash
   # Copy the example environment file
   cp .env.example .env
   ```

3. Configure environment variables:
   - Review and update the `.env` file with your configuration
   - Never commit actual `.env` files to version control

4. Start the development environment:
   ```bash
   # For Unix/Linux/MacOS
   chmod +x scripts/dev.sh
   ./scripts/dev.sh

   # For Windows (PowerShell)
   ./scripts/dev.ps1

   # Or manually with Docker Compose
   docker-compose up -d
   ```

5. Start the production environment (when ready):
   ```bash
   # For Unix/Linux/MacOS
   chmod +x scripts/prod.sh
   ./scripts/prod.sh

   # For Windows (PowerShell)
   ./scripts/prod.ps1

   # Or manually with Docker Compose
   docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
   ```

6. Stop all services:
   ```bash
   # For Unix/Linux/MacOS
   chmod +x scripts/stop.sh
   ./scripts/stop.sh

   # For Windows (PowerShell)
   ./scripts/stop.ps1

   # Or manually with Docker Compose
   docker-compose down
   ```

The application will be available at:
- Frontend: http://localhost:3000
- API Gateway: http://localhost:8080
- Content Service: http://localhost:3002
- User Service: http://localhost:3001
- Interaction Service: http://localhost:3003
- Notification Service: http://localhost:3004
- MongoDB: mongodb://localhost:27017
- PostgreSQL: postgresql://localhost:5432
- Redis: redis://localhost:6379
- Elasticsearch: http://localhost:9200

## Environment Configuration

### Environment Files
- `.env.example`: Template files with placeholder values
- `.env`: Local environment files (not committed to git)
- `.env.development`: Development environment configuration
- `.env.production`: Production environment configuration

### Required Environment Variables
- Database connection strings
- API keys and secrets
- Service ports and URLs
- Authentication credentials
- External service configurations

### Security Best Practices
1. Never commit sensitive data to version control
2. Use environment variables for all configuration
3. Keep API keys and secrets secure
4. Rotate credentials regularly
5. Use different configurations for development and production

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

## Troubleshooting

### Docker Setup Issues

If you encounter any issues during Docker setup:

1. **Missing dependencies**: Check the error message and add any missing dependencies to the appropriate package.json file
2. **TypeScript errors**: Update the import paths or add type definitions as needed
3. **Docker build context issues**: Make sure the build context is set correctly in the docker-compose.yml file
4. **Path resolution issues**: Check the tsconfig.json files to ensure the paths are configured correctly

### Database Connection Issues

1. **MongoDB connection errors**:
   - Check if MongoDB container is running: `docker-compose ps mongodb`
   - Verify connection string in the .env file
   - Check logs: `docker-compose logs mongodb`

2. **PostgreSQL connection errors**:
   - Check if PostgreSQL container is running: `docker-compose ps postgres`
   - Verify connection string in the .env file
   - Check logs: `docker-compose logs postgres`

### Service Startup Issues

1. **Service fails to start**:
   - Check the service logs: `docker-compose logs [service-name]`
   - Verify environment variables are correctly set
   - Check for port conflicts with other applications

2. **Health check failures**:
   - Check if dependent services are running
   - Verify network connectivity between containers
   - Check service logs for specific errors

### Common Issues

1. **Module not found errors**: This is usually due to incorrect import paths or missing dependencies. Make sure the paths in the tsconfig.json files are correct and all dependencies are installed.
2. **Type errors**: Make sure all types are properly defined and imported. If you're using a third-party library, you may need to install its type definitions.
3. **Docker build context issues**: The Docker build context should be set to the project root to ensure all files are available during the build.
4. **Environment variable issues**: Make sure all required environment variables are defined in your .env file.
5. **Volume mounting issues**: If you're using Docker volumes, make sure the paths are correct and the directories exist.

### Cleanup

If you need to clean up and start fresh:

```bash
# Stop all containers and remove volumes
./scripts/clean.sh

# Or manually
docker-compose down -v
```

## Contributing

1. Create a feature branch
2. Make your changes
3. Run tests and linting
4. Submit a pull request

## License

MIT License - see LICENSE file for details