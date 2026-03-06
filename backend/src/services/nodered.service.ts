import axios from 'axios';
import crypto from 'crypto';

const NODE_RED_URL = process.env.NODE_RED_URL || 'http://192.168.20.210:1880';
const NODE_RED_API_KEY = process.env.NODE_RED_API_KEY || 'my-super-secret-api-key-2026';
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || '12345678901234567890123456789012';

const encryptPayload = (data: any): string => {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY, 'hex'), iv);
  let encrypted = cipher.update(JSON.stringify(data));
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  
  return iv.toString('hex') + ':' + encrypted.toString('hex');
};

export const sendDeviceToNodeRed = async (deviceData: any) => {
  const protocol = deviceData.protocol.toLowerCase();
  const endpoint = `${NODE_RED_URL}/api/${protocol}/register`;

  const encryptedData = encryptPayload(deviceData);

  try {
    const response = await axios.post(
      endpoint, 
      { payload: encryptedData }, 
      {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': NODE_RED_API_KEY 
        },
        timeout: 10000
      }
    );

    return response.data;
  } catch (error: any) {
    console.error(`\n[Node-RED Error] Failed to send data to ${endpoint}`);
    console.error('>> Error Message:', error.message);
    if (error.response) {
      console.error('>> Status Code:', error.response.status);
      console.error('>> Response Data:', error.response.data);
    }
    throw new Error(error.response?.data?.message || 'Failed to connect to Node-RED');
  }
};

const decryptPayload = (encryptedData: string): any => {
  try {
    const parts = encryptedData.split(':');
    const iv = Buffer.from(parts[0], 'hex');
    const encryptedText = Buffer.from(parts[1], 'hex');
    
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY, 'hex'), iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    
    return JSON.parse(decrypted.toString());
  } catch (error) {
    throw new Error('Failed to decrypt data from Node-RED');
  }
};

export const permitJoinZigbee = async (durationSeconds: number = 60) => {
  const endpoint = `${NODE_RED_URL}/api/zigbee/permit-join`;
  try {
    const response = await axios.post(
      endpoint, 
      { duration: durationSeconds }, 
      { headers: { 'x-api-key': NODE_RED_API_KEY }, timeout: 5000 }
    );
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to trigger permit join');
  }
};

export const getZigbeeDevicesFromPi = async () => {
  const endpoint = `${NODE_RED_URL}/api/zigbee/devices`;
  try {
    const response = await axios.get(endpoint, {
      headers: { 'x-api-key': NODE_RED_API_KEY },
      timeout: 10000
    });
    
    return decryptPayload(response.data.payload);
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch zigbee devices');
  }
};

export const removeWifiWhitelist = async (macAddress: string) => {
  const endpoint = `${NODE_RED_URL}/api/wifi/whitelist/remove`;
  try {
    const payload = { macAddress };
    const encryptedData = encryptPayload(payload);

    await axios.delete(endpoint, {
      headers: { 'x-api-key': NODE_RED_API_KEY },
      data: { payload: encryptedData }, 
      timeout: 5000
    });
    console.log(`[Node-RED] Removed Wi-Fi MAC: ${macAddress}`);
  } catch (error: any) {
    console.error(`[Node-RED] Failed to remove Wi-Fi whitelist: ${error.message}`);
  }
};

export const removeLorawanDevice = async (devEui: string) => {
  const endpoint = `${NODE_RED_URL}/api/lorawan/remove`;
  try {
    const payload = { devEui };
    const encryptedData = encryptPayload(payload);

    await axios.delete(endpoint, {
      headers: { 'x-api-key': NODE_RED_API_KEY },
      data: { payload: encryptedData },
      timeout: 5000
    });
    console.log(`[Node-RED] Removed LoRaWAN DevEUI: ${devEui}`);
  } catch (error: any) {
    console.error(`[Node-RED] Failed to remove LoRaWAN device: ${error.message}`);
  }
};