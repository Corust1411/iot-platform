import { Request, Response } from 'express';
import * as deviceService from '../services/device.service';

export const createDevice = async (req: Request, res: Response) => {
  try {
    const device = await deviceService.createDevice(req.body);
    res.status(201).json(device);
  } catch (error) {
    res.status(500).json({ message: 'Error creating device', error });
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