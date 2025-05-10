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
    }
};

// Set up proxy routes
Object.entries(services).forEach(([service, options]) => {
    app.use(`/api/${service}`, createProxyMiddleware(options));
});

// Error handling
app.use(errorHandler);

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'healthy' });
});

const PORT = config.port || 3000;
app.listen(PORT, () => {
    logger.info(`API Gateway running on port ${PORT}`);
}); 