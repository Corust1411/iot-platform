import { Router } from 'express';
import * as deviceController from '../controllers/device.controller';
import { verifyToken } from '../middlewares/auth.middleware';

const router = Router();

router.post('/', verifyToken, deviceController.createDevice);
router.get('/', verifyToken, deviceController.getDevices);
router.get('/:id', verifyToken, deviceController.getDeviceById);

export default router;