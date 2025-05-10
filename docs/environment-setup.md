# Environment Setup Guide

This guide explains how to set up the environment configuration for the Shared Voices project.

## Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- MongoDB (for content service)
- PostgreSQL (for user service)

## Environment Configuration

The project uses environment variables for configuration. We provide two scripts to help manage environment files:

1. `setup:env` - Creates `.env.example` files and updates `.gitignore`
2. `copy:env` - Helps create `.env` files from the examples

### Step 1: Create Environment Templates

Run the following command to create environment templates:

```bash
npm run setup:env
```

This will:
- Create `.env.example` files for each service
- Update `.gitignore` to exclude `.env` files
- Generate secure random values for JWT secrets

### Step 2: Create Environment Files

Run the following command to create your environment files:

```bash
npm run copy:env
```

This will:
- Prompt you to create `.env` files for each service
- Copy the example files to create your actual environment files
- Guide you through the process

### Step 3: Configure Environment Variables

After creating the `.env` files, review and update the following:

#### Content Service
- `PORT`: The port number for the content service (default: 3001)
- `MONGODB_URI`: MongoDB connection string
- `MONGODB_DB`: MongoDB database name
- `JWT_SECRET`: Secret key for JWT tokens
- Other configuration as needed

#### User Service
- `PORT`: The port number for the user service (default: 3002)
- `DB_HOST`: PostgreSQL host
- `DB_PORT`: PostgreSQL port
- `DB_USER`: PostgreSQL username
- `DB_PASSWORD`: PostgreSQL password
- `DB_NAME`: PostgreSQL database name
- `JWT_SECRET`: Secret key for JWT tokens
- Other configuration as needed

## Security Best Practices

1. **Never commit `.env` files**
   - Keep your `.env` files local
   - Use `.env.example` for templates
   - Update `.env.example` when adding new variables

2. **Use strong secrets**
   - Generate strong random values for secrets
   - Use different secrets for development and production
   - Rotate secrets regularly

3. **Database security**
   - Use strong passwords
   - Enable SSL for database connections
   - Restrict database access to necessary IPs

## Troubleshooting

### Common Issues

1. **Environment files not created**
   - Ensure you have write permissions
   - Check if the service directories exist
   - Run `npm run setup:env` first

2. **Database connection issues**
   - Verify database credentials
   - Check if databases are running
   - Ensure correct ports are open

3. **JWT issues**
   - Verify JWT_SECRET is set
   - Check JWT_EXPIRES_IN format
   - Ensure consistent secrets across services

## Maintenance

1. **Adding new variables**
   - Add to `.env.example` first
   - Document the variable's purpose
   - Update this guide if necessary

2. **Updating existing variables**
   - Update both `.env` and `.env.example`
   - Document any changes
   - Notify team members of changes

## Support

If you encounter any issues:
1. Check the troubleshooting section
2. Review the error messages
3. Check the service logs
4. Contact the development team 