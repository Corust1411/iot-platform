import { Router } from 'express';
import * as accountController from '../controllers/account.controller';
import { verifyToken } from '../middlewares/auth.middleware';
import { requireAdmin } from '../middlewares/role.middleware';

const router = Router();

router.get('/', verifyToken, requireAdmin, accountController.getAccounts);
router.post('/', verifyToken, requireAdmin, accountController.createAccount);
router.put('/:id', verifyToken, requireAdmin, accountController.updateAccount);
router.delete('/:id', verifyToken, requireAdmin, accountController.deleteAccount);

export default router;