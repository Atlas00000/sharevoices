import { Router } from 'express';
import { ContentController } from '../controllers/content.controller';
import { authenticateJWT } from '../middleware/auth';
import { authorizeRole } from '../middleware/authorize';

const router = Router();
const contentController = new ContentController();

// Public routes
router.get('/', contentController.getAll.bind(contentController));
router.get('/:id', contentController.getById.bind(contentController));
router.get('/stats/global', contentController.getGlobalStatistics.bind(contentController));

// Protected routes (require authentication)
router.post('/',
    authenticateJWT,
    authorizeRole(['admin', 'editor']),
    contentController.create.bind(contentController)
);

router.put('/:id',
    authenticateJWT,
    authorizeRole(['admin', 'editor']),
    contentController.update.bind(contentController)
);

router.delete('/:id',
    authenticateJWT,
    authorizeRole(['admin']),
    contentController.delete.bind(contentController)
);

router.post('/:id/publish',
    authenticateJWT,
    authorizeRole(['admin', 'editor']),
    contentController.publish.bind(contentController)
);

// Versioning routes
router.get('/:id/versions',
    authenticateJWT,
    authorizeRole(['admin', 'editor']),
    contentController.getVersions.bind(contentController)
);

router.get('/:id/versions/:version',
    authenticateJWT,
    authorizeRole(['admin', 'editor']),
    contentController.getVersion.bind(contentController)
);

router.post('/:id/versions/:version/restore',
    authenticateJWT,
    authorizeRole(['admin', 'editor']),
    contentController.restoreVersion.bind(contentController)
);

// Statistics routes
router.get('/:id/stats',
    authenticateJWT,
    authorizeRole(['admin', 'editor']),
    contentController.getStatistics.bind(contentController)
);

export default router; 