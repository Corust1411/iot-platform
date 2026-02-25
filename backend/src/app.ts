import express from 'express';
import cors from 'cors';
import deviceRoutes from './routes/device.route';

const app = express();

app.use(cors());
app.use(express.json());
app.use('/api/devices', deviceRoutes);

app.get('/', (req, res) => {
  res.send('IoT Platform Backend Running');
});

export default app;