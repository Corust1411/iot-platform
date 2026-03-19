import { Router } from 'express';
import * as logController from '../controllers/log.controller';
import { verifyToken } from '../middlewares/auth.middleware';
import { requireAdmin } from '../middlewares/role.middleware';

const router = Router();

router.get('/', verifyToken, requireAdmin, logController.getAuditLogs);

export default router;