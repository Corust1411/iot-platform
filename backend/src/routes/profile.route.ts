import { Router } from 'express';
import { verifyToken } from '../middlewares/auth.middleware';
import * as profileController from '../controllers/profile.controller';

const router = Router();

router.get('/', verifyToken, profileController.getProfile);
router.put('/', verifyToken, profileController.updateProfile);
router.put('/password', verifyToken, profileController.changePassword);

export default router;