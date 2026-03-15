import express from 'express';
import cors from 'cors';
import deviceRoutes from './routes/device.route';
import authRoutes from './routes/auth.route';
import accountRoutes from './routes/account.route';
import dashboardRoutes from './routes/dashboard.route';
import profileRoutes from './routes/profile.route';

const app = express();

app.use(cors());
app.use(express.json());
app.use('/api/devices', deviceRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/accounts', accountRoutes);
app.use('/api/dashboards', dashboardRoutes);
app.use('/api/profile', profileRoutes);

app.get('/', (req, res) => {
  res.send('IoT Platform Backend Running');
});

export default app;