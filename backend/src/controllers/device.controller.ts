import { Request, Response } from 'express';
import * as deviceService from '../services/device.service';
import * as nodeRedService from '../services/nodered.service';

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
    
    const payloadForPi = {
      device_id: newDevice.id,
      name: req.body.name,
      category: req.body.category,
      protocol: req.body.protocol,
      config: req.body.config 
    }
    try {
      await nodeRedService.sendDeviceToNodeRed(payloadForPi);
      
      return res.status(201).json({
        message: 'Device created and provisioned to Raspberry Pi successfully',
        device: newDevice
      });

    } catch (piError: any) {
      console.warn('Device saved in DB, but failed to reach Raspberry Pi:', piError.message);
      
      return res.status(207).json({ 
        message: 'Device saved in Database, but failed to sync with Raspberry Pi',
        error: piError.message,
        device: newDevice
      });
    }

  } catch (error: any) {
    console.error('Create Device Error:', error);
    return res.status(500).json({ message: 'Failed to create device', error: error.message });
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

export const getDeviceById = async (req: AuthRequest, res: Response) => {
  try {
    const accountId = req.user?.id;
    const deviceId = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id); 

    if (!accountId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const device = await deviceService.getDeviceById(accountId, deviceId);
    res.status(200).json(device);

  } catch (error: any) {
    console.error('Get Device Error:', error);
    res.status(404).json({ message: error.message });
  }
};

export const deleteDevice = async (req: AuthRequest, res: Response) => {
  try {
    const accountId = req.user?.id;
    const deviceId = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id);

    if (!accountId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    await deviceService.deleteDeviceById(accountId, deviceId);
    res.status(200).json({ message: 'Device deleted successfully' });

  } catch (error: any) {
    console.error('Delete Device Error:', error);
    res.status(400).json({ message: error.message });
  }
};

export const updateDevice = async (req: AuthRequest, res: Response) => {
  try {
    const accountId = req.user?.id;
    const deviceId = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id);

    if (!accountId) return res.status(401).json({ message: 'Unauthorized' });

    await deviceService.updateDeviceById(accountId, deviceId, req.body);
    res.status(200).json({ message: 'Device updated successfully' });

  } catch (error: any) {
    console.error('Update Device Error:', error);
    res.status(400).json({ message: error.message });
  }
};

// ... (โค้ดเดิม) ...

// Controller สำหรับกดปุ่ม Scan
export const scanZigbeeNetwork = async (req: AuthRequest, res: Response) => {
  try {
    // สั่งเปิด Permit Join เป็นเวลา 60 วินาที
    await nodeRedService.permitJoinZigbee(60);
    return res.status(200).json({ message: 'Zigbee permit join enabled for 60 seconds.' });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

// Controller สำหรับดึงและกรองอุปกรณ์
export const discoverUnregisteredZigbeeDevices = async (req: AuthRequest, res: Response) => {
  try {
    const accountId = req.user?.id;
    if (!accountId) return res.status(401).json({ message: 'Unauthorized' });

    // 1. ไปดูดข้อมูลมาจาก Pi (ได้เป็น Array ของอุปกรณ์)
    const piDevices = await nodeRedService.getZigbeeDevicesFromPi();
    
    // 2. ไปดูด ieeeAddr จาก Database ของเรา
    const registeredAddrs = await deviceService.getRegisteredZigbeeIeeeAddrs(accountId);

    // 3. กรองเอาเฉพาะตัวที่ Pi มี แต่ Database ยังไม่มี (ยังไม่ได้ลงทะเบียน)
    const unregisteredDevices = piDevices.filter((piDevice: any) => {
      // ตรวจสอบว่า ieeeAddr ของ Pi ไม่ตรงกับใน Database (แปลงตัวพิมพ์เล็กเพื่อความชัวร์)
      return !registeredAddrs.some(
        (regAddr) => regAddr.toLowerCase() === piDevice.ieeeAddr.toLowerCase()
      );
    });

    return res.status(200).json({ 
      message: 'Discovery successful', 
      devices: unregisteredDevices 
    });

  } catch (error: any) {
    console.error('Discover Zigbee Error:', error);
    return res.status(500).json({ message: 'Failed to discover devices', error: error.message });
  }
};