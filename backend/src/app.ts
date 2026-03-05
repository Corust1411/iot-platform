import express from 'express';
import cors from 'cors';
import deviceRoutes from './routes/device.route';
import authRoutes from './routes/auth.route';
import dashboardRoutes from './routes/dashboard.route';

const app = express();

app.use(cors());
app.use(express.json());
app.use('/api/devices', deviceRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/dashboards', dashboardRoutes);

app.get('/', (req, res) => {
  res.send('IoT Platform Backend Running');
});

export default app;