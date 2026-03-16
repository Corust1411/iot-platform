import mqtt from 'mqtt';
import { pool } from '../config/db';
import { Server } from 'socket.io';

const MQTT_BROKER_URL = process.env.MQTT_BROKER_URL || 'mqtt://localhost:1883';
let mqttClient: mqtt.MqttClient;

export const initMqttClient = (io: Server) => {
  const client = mqtt.connect(MQTT_BROKER_URL);
  mqttClient = client;

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
        WHERE LOWER(d.protocol::text) = LOWER($1) 
        AND (
          LOWER(c.config->>'macAddress') = LOWER($2) OR 
          LOWER(c.config->>'ieeeAddr') = LOWER($2) OR 
          LOWER(c.config->>'devEui') = LOWER($2)
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

        let inputValue: string |number;
        if (typeof rawValue === 'number') {
          inputValue = rawValue;
        } else if (typeof rawValue === 'boolean') {
          inputValue = rawValue ? 1 : 0;
        } else if (typeof rawValue === 'string') {
          const upperVal = rawValue.toUpperCase();
          if (upperVal === 'ON') {
            inputValue = 1;
          } else if (upperVal === 'OFF') {
            inputValue = 0;
          } else {
            if (!isNaN(Number(rawValue)) && rawValue.trim() !== '') {
              inputValue = Number(rawValue);
            } else {
              inputValue = rawValue.trim();
            }
          }
        } else {
          continue;
        }
        const insertQuery = `
          INSERT INTO device_telemetry (device_id, key, value, time)
          VALUES ($1, $2, $3, NOW())
        `;
        await pool.query(insertQuery, [internalDeviceId, key, String(inputValue)]);

        io.emit('telemetry_update', {
          device_id: internalDeviceId,
          key: key,
          value: inputValue
        });
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

export const publishCommand = (topic: string, payload: any) => {
  if (mqttClient && mqttClient.connected) {
    mqttClient.publish(topic, JSON.stringify(payload));
    console.log(`📤 [Control] Published to ${topic}:`, payload);
  } else {
    console.error("❌ MQTT Client is not connected. Cannot publish.");
  }
};