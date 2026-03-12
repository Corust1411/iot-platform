import app from './app';
import { testConnection } from './config/db';
import { initMqttClient } from './services/mqtt.service';
import http from 'http';
import { Server } from 'socket.io';

const PORT = process.env.PORT;
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' }
});

io.on('connection', (socket) => {
  console.log('⚡ Client connected to Socket.io:', socket.id);
});

const startServer = async () => {
  await testConnection();

  server.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    initMqttClient(io);
  });
};

startServer();