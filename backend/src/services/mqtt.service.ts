import mqtt from 'mqtt';
import { pool } from '../config/db';

const MQTT_BROKER_URL = process.env.MQTT_BROKER_URL || 'mqtt://localhost:1883';

export const initMqttClient = () => {
  const client = mqtt.connect(MQTT_BROKER_URL);

  client.on('connect', () => {
    console.log('✅ Connected to Central MQTT Broker (Backend)');
    client.subscribe([
      '/wifi/gateway/#', 'wifi/gateway/#',
      '/zigbee2mqtt/#', 'zigbee2mqtt/#',
      '/application/#', 'application/#'
    ]);
    console.log('📡 Subscribed to telemetry topics');
  });

  client.on('message', async (topic, message) => {
    try {
      const payload = JSON.parse(message.toString());
      if (!payload.object || !payload.protocol || !payload.device_id) return;

      console.log(`📥 [${payload.protocol}] Data received from ${payload.device_id} on topic: ${topic}`);
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
        console.warn(`⚠️ Device ${payload.device_id} not found in database. Ignoring data.`);
        return; 
      }

      const internalDeviceId = deviceRes.rows[0].id;

      const keys = Object.keys(payload.object);
      for (const key of keys) {
        let rawValue = payload.object[key];
        if (rawValue === null || rawValue === undefined || typeof rawValue === 'object') continue; 

        let numericValue: number;
        // format value to number
        if (typeof rawValue === 'number') {
          numericValue = rawValue;
        } else if (typeof rawValue === 'boolean') {
          numericValue = rawValue ? 1 : 0;
        } else if (typeof rawValue === 'string') {
          const upperVal = rawValue.toUpperCase();
          if (upperVal === 'ON') {
            numericValue = 1;
          } else if (upperVal === 'OFF') {
            numericValue = 0;
          } else {
            // ลองแปลงตัวหนังสืออื่นๆ เป็นตัวเลข ถ้าแปลงไม่ได้ (NaN) ให้ข้ามไปเลย
            numericValue = parseFloat(rawValue);
            if (isNaN(numericValue)) {
              console.warn(`⚠️ Skipping non-numeric value: "${rawValue}" for key: "${key}"`);
              continue; 
            }
          }
        } else {
          continue;
        }
        const insertQuery = `
          INSERT INTO device_telemetry (device_id, key, value, time)
          VALUES ($1, $2, $3, NOW())
        `;
        await pool.query(insertQuery, [internalDeviceId, key, numericValue]);
      }

      await pool.query('UPDATE device SET last_seen = NOW() WHERE id = $1', [internalDeviceId]);
      
      console.log(`✅ Saved telemetry for device ID: ${internalDeviceId}`);

    } catch (error) {
      console.error(`❌ Error processing MQTT message on topic ${topic}:`);
      console.error("Error Detail:", error instanceof Error ? error.message : error);
      console.error("Stack Trace:", error instanceof Error ? error.stack : 'No stack trace');
    }
  });

  client.on('error', (err) => {
    console.error('❌ MQTT Connection Error:', err);
  });
};