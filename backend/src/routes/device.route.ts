import { Router } from 'express';
import * as deviceController from '../controllers/device.controller';
import { verifyToken } from '../middlewares/auth.middleware';

const router = Router();

router.post('/', verifyToken, deviceController.createDevice);
router.get('/', verifyToken, deviceController.getDevices);
router.get('/:id', verifyToken, deviceController.getDeviceById);
router.delete('/:id', verifyToken, deviceController.deleteDevice);
router.put('/:id', verifyToken, deviceController.updateDevice);

router.post('/zigbee/permit-join', verifyToken, deviceController.scanZigbeeNetwork);
router.get('/zigbee/discover', verifyToken, deviceController.discoverUnregisteredZigbeeDevices);

export default router;