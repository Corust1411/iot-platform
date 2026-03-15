import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import * as dashboardService from '../services/dashboard.service';
import { pool } from '../config/db';

export const getDashboardRole = async (dashboardId: number, accountId: number): Promise<string | null> => {
  const query = `
    SELECT 'owner'::text as role 
    FROM dashboard 
    WHERE id = $1 AND account_id = $2
    
    UNION
    
    SELECT permission::text as role 
    FROM dashboard_share 
    WHERE dashboard_id = $1 AND account_id = $2
  `;
  
  const result = await pool.query(query, [dashboardId, accountId]);
  
  if (result.rowCount === 0) return null;
  
  return result.rows[0].role;
};

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
    const dashboardId = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id);
    const accountId = req.user?.id;
    if (!accountId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const role = await getDashboardRole(dashboardId, accountId);

    if (role !== 'owner') {
      return res.status(403).json({ message: "Forbidden: Only the owner can share this dashboard." });
    }
    
    
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
    const accountId = req.user?.id;
    if (!accountId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const role = await getDashboardRole(dashboardId, accountId);
    const widgetData = req.body;

    if (!role || role === 'view') {
      return res.status(403).json({ message: "Forbidden: You do not have permission to modify widgets." });
    }

    const widget = await dashboardService.createDashboardWidget(dashboardId, widgetData);
    res.status(201).json(widget);
  } catch (error: any) {
    console.error("❌ Create Widget Error:", error); 
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
        const dashboardId = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id);
    const accountId = req.user?.id;
    if (!accountId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const role = await getDashboardRole(dashboardId, accountId);

    if (role !== 'owner') {
      return res.status(403).json({ message: "Forbidden: Only the owner can share this dashboard." });
    }

    const widgetId = parseInt(Array.isArray(req.params.widgetId) ? req.params.widgetId[0] : req.params.widgetId);
    const { title, data_key, config } = req.body;

    const updated = await dashboardService.updateWidget(widgetId, title, data_key, config);
    res.status(200).json(updated);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteWidgetData = async (req: AuthRequest, res: Response) => {
  try {
    const dashboardId = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id);
    const accountId = req.user?.id;
    if (!accountId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const role = await getDashboardRole(dashboardId, accountId);

    if (role !== 'owner') {
      return res.status(403).json({ message: "Forbidden: Only the owner can share this dashboard." });
    }

    const widgetId = parseInt(Array.isArray(req.params.widgetId) ? req.params.widgetId[0] : req.params.widgetId);
    await dashboardService.deleteWidget(widgetId);
    res.status(200).json({ message: "Widget deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getDashboardShares = async (req: AuthRequest, res: Response) => {
  try {
    const dashboardId = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id);
    const query = `
      SELECT ds.id as share_id, a.email, a.username, ds.permission 
      FROM dashboard_share ds
      JOIN account a ON ds.account_id = a.id
      WHERE ds.dashboard_id = $1
    `;
    const result = await pool.query(query, [dashboardId]);
    res.status(200).json(result.rows);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const shareDashboard = async (req: AuthRequest, res: Response) => {
  try {
    const dashboardId = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id);
    const { email, permission } = req.body;
    const accountId = req.user?.id;
    if (!accountId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const role = await getDashboardRole(dashboardId, accountId);

    if (role !== 'owner') {
      return res.status(403).json({ message: "Forbidden: Only the owner can share this dashboard." });
    }

    const userRes = await pool.query(`SELECT id FROM account WHERE email = $1`, [email]);
    if (userRes.rowCount === 0) return res.status(404).json({ message: "User not found" });
    const targetaccountId = userRes.rows[0].id;

    const checkRes = await pool.query(`SELECT id FROM dashboard_share WHERE dashboard_id = $1 AND account_id = $2`, [dashboardId, targetaccountId]);
    if ((checkRes.rowCount ?? 0) > 0) return res.status(400).json({ message: "Dashboard already shared with this user" });

    await pool.query(
      `INSERT INTO dashboard_share (dashboard_id, account_id, permission) VALUES ($1, $2, $3)`,
      [dashboardId, targetaccountId, permission]
    );
    res.status(201).json({ message: "Dashboard shared successfully" });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateSharePermission = async (req: AuthRequest, res: Response) => {
  try {
    const dashboardId = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id);
    const accountId = req.user?.id;
    if (!accountId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const role = await getDashboardRole(dashboardId, accountId);

    if (role !== 'owner') {
      return res.status(403).json({ message: "Forbidden: Only the owner can share this dashboard." });
    }

    const { shareId } = req.params;
    const { permission } = req.body;
    await pool.query(`UPDATE dashboard_share SET permission = $1 WHERE id = $2`, [permission, shareId]);
    res.status(200).json({ message: "Permission updated" });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const removeShare = async (req: AuthRequest, res: Response) => {
  try {
    const dashboardId = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id);
    const accountId = req.user?.id;
    if (!accountId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const role = await getDashboardRole(dashboardId, accountId);

    if (role !== 'owner') {
      return res.status(403).json({ message: "Forbidden: Only the owner can share this dashboard." });
    }

    const { shareId } = req.params;
    await pool.query(`DELETE FROM dashboard_share WHERE id = $1`, [shareId]);
    res.status(200).json({ message: "Access removed" });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getDashboardById = async (req: AuthRequest, res: Response) => {
  try {
    const dashboardId = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id);
    const userId = req.user?.id; 

    const query = `
      SELECT d.*, 'owner' as role 
      FROM dashboard d 
      WHERE d.id = $1 AND d.user_id = $2
      UNION
      SELECT d.*, ds.permission as role 
      FROM dashboard d 
      JOIN dashboard_share ds ON d.id = ds.dashboard_id 
      WHERE d.id = $1 AND ds.account_id = $2
    `;
    
    const result = await pool.query(query, [dashboardId, userId]);

    if (result.rowCount === 0) {
      return res.status(403).json({ message: "Access denied or dashboard not found" });
    }

    res.status(200).json(result.rows[0]);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};