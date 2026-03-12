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

export const getDashboardDetails = async (req: AuthRequest, res: Response) => {
  try {
    const accountId = req.user?.id;
    const dashboardId = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id);
    if (!accountId) return res.status(401).json({ message: 'Unauthorized' });

    const dashboard = await dashboardService.getDashboardById(accountId, dashboardId);
    if (!dashboard) return res.status(404).json({ message: 'Dashboard not found' });

    res.status(200).json(dashboard);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getDashboardDevices = async (req: AuthRequest, res: Response) => {
  try {
    const dashboardId = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id);
    const devices = await dashboardService.getDashboardDevices(dashboardId);
    res.status(200).json(devices);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

export const addDeviceToDashboard = async (req: AuthRequest, res: Response) => {
  try {
    const dashboardId = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id);
    const { device_id, alias } = req.body;
    if (!device_id) {
      return res.status(400).json({ message: 'Device ID is required' });
    }
    const result = await dashboardService.addDeviceToDashboard(dashboardId, device_id, alias);
    res.status(201).json(result);
  } catch (error: any) {
    console.error("Add Device to Dashboard Error:", error);
    res.status(500).json({ message: 'Internal server error while linking device' });
  }
};

export const removeDeviceFromDashboard = async (req: AuthRequest, res: Response) => {
  try {
    const paramId = req.params.deviceId;
    const dashboardDeviceId = parseInt(paramId as string, 10);
    await dashboardService.removeDeviceFromDashboard(dashboardDeviceId);
    res.status(200).json({ message: 'Device removed from dashboard successfully' });
  } catch (error: any) {
    console.error("Delete Linked Device Error:", error.message);
    res.status(500).json({ message: error.message });
  }
}

export const createDashboardWidget = async (req: AuthRequest, res: Response) => {
  try {
    const dashboardId = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id);
    const widgetData = req.body;
    const widget = await dashboardService.createDashboardWidget(dashboardId, widgetData);
    res.status(201).json(widget);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getDashboardWidgets = async (req: AuthRequest, res: Response) => {
  try {
    const dashboardId = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id);
    const widgets = await dashboardService.getDashboardWidgets(dashboardId);
    res.status(200).json(widgets);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateWidgetData = async (req: AuthRequest, res: Response) => {
  try {
    const widgetId = parseInt(Array.isArray(req.params.widgetId) ? req.params.widgetId[0] : req.params.widgetId);
    const { title, config } = req.body;
    const updated = await dashboardService.updateWidget(widgetId, title, config);
    res.status(200).json(updated);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteWidgetData = async (req: AuthRequest, res: Response) => {
  try {
    const widgetId = parseInt(Array.isArray(req.params.widgetId) ? req.params.widgetId[0] : req.params.widgetId);
    await dashboardService.deleteWidget(widgetId);
    res.status(200).json({ message: "Widget deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};