import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { authenticateJWT } from '../middleware/auth';
import { authorizeRole } from '../middleware/authorize';

const router = Router();
const userController = new UserController();

// Public routes
router.post('/', userController.create.bind(userController));

// Protected routes
router.get('/', 
    authenticateJWT, 
    authorizeRole(['admin']), 
    userController.getAll.bind(userController)
);

router.get('/:id', 
    authenticateJWT, 
    userController.getById.bind(userController)
);

router.put('/:id', 
    authenticateJWT, 
    userController.update.bind(userController)
);

router.delete('/:id', 
    authenticateJWT, 
    authorizeRole(['admin']), 
    userController.delete.bind(userController)
);

export default router; 