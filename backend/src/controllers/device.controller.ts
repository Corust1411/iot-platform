import { Request, Response } from 'express';
import * as deviceService from '../services/device.service';

interface AuthRequest extends Request {
  user?: { id: number; role: string };
}

export const createDevice = async (req: AuthRequest, res: Response) => {
  try {
    const accountId = req.user?.id; 
    
    if (!accountId) {
      return res.status(401).json({ message: 'Unauthorized: User not found in token' });
    }

    const newDevice = await deviceService.createNewDevice(accountId, req.body);
    res.status(201).json(newDevice);

  } catch (error: any) {
    console.error('Create Device Error:', error);
    res.status(500).json({ message: 'Failed to create device', error: error.message });
  }
};

export const getDevices = async (req: Request, res: Response) => {
  try {
    const devices = await deviceService.getAllDevices();
    res.json(devices);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching devices', error });
  }
};