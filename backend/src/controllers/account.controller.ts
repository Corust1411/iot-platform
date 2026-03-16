import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import * as accountService from '../services/account.service';

export const getAccounts = async (req: AuthRequest, res: Response) => {
  try {
    const accounts = await accountService.getAllAccounts();
    res.status(200).json(accounts);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const createAccount = async (req: AuthRequest, res: Response) => {
  try {
    const newAccount = await accountService.createAccount(req.body);
    res.status(201).json({ message: 'Account created successfully', account: newAccount });
  } catch (error: any) {
    if (error.code === '23505') {
      return res.status(400).json({ message: 'Username or Email already exists' });
    }
    res.status(400).json({ message: error.message });
  }
};

export const updateAccount = async (req: AuthRequest, res: Response) => {
  try {
    const idParam = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const accountId = parseInt(idParam as string);
    const updatedAccount = await accountService.updateAccount(accountId, req.body);
    res.status(200).json({ message: 'Account updated successfully', account: updatedAccount });
  } catch (error: any) {
    if (error.code === '23505') return res.status(400).json({ message: 'Username or Email already exists' });
    res.status(400).json({ message: error.message });
  }
};

export const deleteAccount = async (req: AuthRequest, res: Response) => {
  try {
    const idParam = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const accountId = parseInt(idParam as string);

    if (isNaN(accountId)) {
      return res.status(400).json({ message: "Invalid account ID" });
    }

    if (req.user?.id === accountId) {
      return res.status(400).json({ message: "You cannot delete your own account" });
    }
    
    await accountService.deleteAccount(accountId);
    res.status(200).json({ message: 'Account deleted successfully' });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};