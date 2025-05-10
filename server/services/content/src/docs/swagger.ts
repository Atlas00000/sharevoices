import { SwaggerOptions } from 'swagger-jsdoc';

const swaggerOptions: SwaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Shared Voices Content Service API',
            version: '1.0.0',
            description: 'API documentation for the Shared Voices Content Service',
        },
        servers: [
            {
                url: 'http://localhost:3001',
                description: 'Development server',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
            schemas: {
                Article: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', format: 'uuid' },
                        title: { type: 'string' },
                        content: { type: 'string' },
                        slug: { type: 'string' },
                        category: { type: 'string' },
                        tags: { type: 'array', items: { type: 'string' } },
                        authorId: { type: 'string', format: 'uuid' },
                        status: { type: 'string', enum: ['draft', 'published', 'archived'] },
                        featuredImage: { type: 'string', format: 'uri' },
                        mediaUrls: { type: 'array', items: { type: 'string', format: 'uri' } },
                        viewCount: { type: 'number' },
                        likeCount: { type: 'number' },
                        commentCount: { type: 'number' },
                        createdAt: { type: 'string', format: 'date-time' },
                        updatedAt: { type: 'string', format: 'date-time' },
                        publishedAt: { type: 'string', format: 'date-time' },
                    },
                },
                Error: {
                    type: 'object',
                    properties: {
                        message: { type: 'string' },
                        errors: { type: 'array', items: { type: 'object' } },
                    },
                },
            },
        },
    },
    apis: ['./src/routes/*.ts'], // Path to the API routes
};

export default swaggerOptions; 