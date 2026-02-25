import { Router } from 'express';
import * as deviceController from '../controllers/device.controller';

const router = Router();

router.post('/', deviceController.createDevice);
router.get('/', deviceController.getDevices);

export default router;