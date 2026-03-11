import { Router } from 'express';
import * as dashboardController from '../controllers/dashboard.controller';
import { verifyToken } from '../middlewares/auth.middleware';

const router = Router();

router.get('/:id/devices', verifyToken, dashboardController.getDashboardDevices);
router.post('/:id/devices', verifyToken, dashboardController.addDeviceToDashboard);
router.delete('/devices/:deviceId', verifyToken, dashboardController.removeDeviceFromDashboard);

router.post('/:id/widgets', verifyToken, dashboardController.createDashboardWidget);

router.post('/', verifyToken, dashboardController.createDashboard);
router.get('/', verifyToken, dashboardController.getDashboards);
router.put('/:id', verifyToken, dashboardController.updateDashboard);
router.delete('/:id', verifyToken, dashboardController.deleteDashboard);
router.get('/:id', verifyToken, dashboardController.getDashboardDetails);

export default router;