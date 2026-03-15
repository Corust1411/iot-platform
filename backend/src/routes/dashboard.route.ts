import { Router } from 'express';
import * as dashboardController from '../controllers/dashboard.controller';
import { verifyToken } from '../middlewares/auth.middleware';

const router = Router();

router.get('/:id/shares', verifyToken, dashboardController.getDashboardShares);
router.post('/:id/shares', verifyToken, dashboardController.shareDashboard);
router.put('/:id/shares/:shareId', verifyToken, dashboardController.updateSharePermission);
router.delete('/:id/shares/:shareId', verifyToken, dashboardController.removeShare);

router.get('/:id/devices', verifyToken, dashboardController.getDashboardDevices);
router.post('/:id/devices', verifyToken, dashboardController.addDeviceToDashboard);
router.delete('/devices/:deviceId', verifyToken, dashboardController.removeDeviceFromDashboard);

router.post('/:id/widgets', verifyToken, dashboardController.createDashboardWidget);
router.get('/:id/widgets', verifyToken, dashboardController.getDashboardWidgets);
router.put('/:id/widgets/:widgetId', verifyToken, dashboardController.updateWidgetData);
router.delete('/:id/widgets/:widgetId', verifyToken, dashboardController.deleteWidgetData);

router.post('/', verifyToken, dashboardController.createDashboard);
router.get('/', verifyToken, dashboardController.getDashboards);
router.put('/:id', verifyToken, dashboardController.updateDashboard);
router.delete('/:id', verifyToken, dashboardController.deleteDashboard);
router.get('/:id', verifyToken, dashboardController.getDashboardDetails);

export default router;