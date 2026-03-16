import { reactive } from 'vue';

export const mqttStore = reactive({
  client: null,
  isConnected: false,
  connection: {
    protocol: 'ws',
    host: 'localhost',
    port: 9001,
    path: '/',
    clientId: 'kmitl_iot_' + Math.random().toString(16).substr(2, 8),
  },
  subscriptions: [],
  messages: []
});