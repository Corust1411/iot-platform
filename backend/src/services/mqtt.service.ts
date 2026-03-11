import mqtt from 'mqtt';
import { pool } from '../config/db';

const MQTT_BROKER_URL = process.env.MQTT_BROKER_URL || 'mqtt://localhost:1883';

export const initMqttClient = () => {
  const client = mqtt.connect(MQTT_BROKER_URL);

  client.on('connect', () => {
    console.log('Connected to Central MQTT Broker');
    
    client.subscribe('gateway/#');
    client.subscribe('zigbee2mqtt/#');
    client.subscribe('application/+/device/+/event/up');
    console.log('📡 Subscribed to telemetry topics');
  });

  client.on('message', async (topic, message) => {
    try {
      const payload = JSON.parse(message.toString());
      
      if (!payload.object || !payload.protocol || !payload.device_id) return;

      console.log(`📥 [${payload.protocol}] Data received from ${payload.device_id}`);

      const findDeviceQuery = `
        SELECT d.id 
        FROM device d
        JOIN device_protocol_config c ON d.id = c.device_id
        WHERE d.protocol = $1 
        AND (
          c.config->>'macAddress' = $2 OR 
          c.config->>'ieeeAddr' = $2 OR 
          c.config->>'devEui' = $2
        )
      `;
      const deviceRes = await pool.query(findDeviceQuery, [payload.protocol, payload.device_id]);
      
      if (deviceRes.rowCount === 0) {
        console.warn(`⚠️ Device ${payload.device_id} not found in database.`);
        return;
      }
      const internalDeviceId = deviceRes.rows[0].id;
      const keys = Object.keys(payload.object);
      for (const key of keys) {
        const value = payload.object[key];
        if (typeof value === 'object') continue; 
        const insertQuery = `
          INSERT INTO device_telemetry (device_id, key, value)
          VALUES ($1, $2, $3)
        `;
        await pool.query(insertQuery, [internalDeviceId, key, String(value)]);
      }
      await pool.query('UPDATE device SET last_seen = NOW() WHERE id = $1', [internalDeviceId]);
    } catch (error) {
      console.error(`MQTT Parse Error on topic ${topic}:`, error);
    }
  });
};