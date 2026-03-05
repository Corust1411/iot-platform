import { Router } from 'express';
import * as dashboardController from '../controllers/dashboard.controller';
import { verifyToken } from '../middlewares/auth.middleware';

const router = Router();

router.post('/', verifyToken, dashboardController.createDashboard);
router.get('/', verifyToken, dashboardController.getDashboards);
router.put('/:id', verifyToken, dashboardController.updateDashboard);
router.delete('/:id', verifyToken, dashboardController.deleteDashboard);

export default router;