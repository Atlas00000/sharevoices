import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cors from 'cors';
import { sanitize } from 'express-mongo-sanitize';
import { errorHandler } from './middleware/error';
import { logger } from './utils/logger';
import { config } from './config';

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
    origin: config.corsOrigins,
    credentials: true
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later'
});
app.use(limiter);

// Input sanitization
app.use(sanitize());

// Request logging
app.use((req, res, next) => {
    logger.info(`${req.method} ${req.url}`);
    next();
});

// Service routing
const services = {
    content: {
        target: config.services.content.url,
        pathRewrite: { '^/api/content': '' },
        changeOrigin: true,
        onError: (err, req, res) => {
            logger.error(`Content service error: ${err.message}`);
            res.status(500).json({ error: 'Content service unavailable' });
        }
    },
    user: {
        target: config.services.user.url,
        pathRewrite: { '^/api/users': '' },
        changeOrigin: true,
        onError: (err, req, res) => {
            logger.error(`User service error: ${err.message}`);
            res.status(500).json({ error: 'User service unavailable' });
        }
    },
    interaction: {
        target: config.services.interaction.url,
        pathRewrite: { '^/api/interactions': '' },
        changeOrigin: true,
        onError: (err, req, res) => {
            logger.error(`Interaction service error: ${err.message}`);
            res.status(500).json({ error: 'Interaction service unavailable' });
        }
    },
    notification: {
        target: config.services.notification.url,
        pathRewrite: { '^/api/notifications': '' },
        changeOrigin: true,
        onError: (err, req, res) => {
            logger.error(`Notification service error: ${err.message}`);
            res.status(500).json({ error: 'Notification service unavailable' });
        }
    }
};

// Set up proxy routes
Object.entries(services).forEach(([service, options]) => {
    app.use(`/api/${service}`, createProxyMiddleware(options));
});

// Error handling
app.use(errorHandler);

// Health check endpoint
app.get('/health', async (req, res) => {
    const serviceStatus = {};

    // Check each service
    for (const [name, options] of Object.entries(services)) {
        try {
            const url = `${options.target}/health`;
            const response = await fetch(url, { method: 'GET', timeout: 2000 });
            serviceStatus[name] = response.ok ? 'healthy' : 'unhealthy';
        } catch (error) {
            logger.warn(`Health check failed for ${name} service: ${error.message}`);
            serviceStatus[name] = 'unavailable';
        }
    }

    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        service: 'api-gateway',
        version: process.env.npm_package_version || '1.0.0',
        services: serviceStatus
    });
});

const PORT = config.port || 3000;
app.listen(PORT, () => {
    logger.info(`API Gateway running on port ${PORT}`);
});