import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import * as dashboardService from '../services/dashboard.service';

export const createDashboard = async (req: AuthRequest, res: Response) => {
  try {
    const accountId = req.user?.id;
    const { name, description } = req.body;
    if (!accountId) return res.status(401).json({ message: 'Unauthorized' });

    const newDashboard = await dashboardService.createDashboard(accountId, name, description);
    res.status(201).json(newDashboard);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getDashboards = async (req: AuthRequest, res: Response) => {
  try {
    const accountId = req.user?.id;
    if (!accountId) return res.status(401).json({ message: 'Unauthorized' });

    const dashboards = await dashboardService.getDashboardsByAccountId(accountId);
    res.status(200).json(dashboards);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateDashboard = async (req: AuthRequest, res: Response) => {
  try {
    const accountId = req.user?.id;
    const dashboardId = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id);
    const { name, description } = req.body;
    if (!accountId) return res.status(401).json({ message: 'Unauthorized' });

    const updated = await dashboardService.updateDashboard(accountId, dashboardId, name, description);
    res.status(200).json(updated);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteDashboard = async (req: AuthRequest, res: Response) => {
  try {
    const accountId = req.user?.id;
    const dashboardId = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id);
    if (!accountId) return res.status(401).json({ message: 'Unauthorized' });

    await dashboardService.deleteDashboard(accountId, dashboardId);
    res.status(200).json({ message: 'Dashboard deleted successfully' });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};