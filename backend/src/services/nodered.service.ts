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
    // --- เพิ่ม 4 บรรทัดนี้เพื่อดู Error จริงๆ ---
    console.error('>> Error Message:', error.message);
    if (error.response) {
      console.error('>> Status Code:', error.response.status);
      console.error('>> Response Data:', error.response.data);
    }
    // ----------------------------------------
    throw new Error(error.response?.data?.message || 'Failed to connect to Node-RED');
  }
};