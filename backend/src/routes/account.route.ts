import { Router } from 'express';
import { getAccounts, createAccount, updateAccount, deleteAccount } from '../controllers/account.controller';
import { verifyToken } from '../middlewares/auth.middleware';
import { requireAdmin } from '../middlewares/role.middleware';

const router = Router();

router.get('/', verifyToken, requireAdmin, getAccounts);
router.post('/', verifyToken, requireAdmin, createAccount);
router.put('/:id', verifyToken, requireAdmin, updateAccount);
router.delete('/:id', verifyToken, requireAdmin, deleteAccount);

export default router;