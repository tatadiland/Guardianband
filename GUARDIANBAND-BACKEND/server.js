import express from 'express';
import cors from 'cors';
import { connectDB, sequelize } from './db.connect.js';
import userRouter from './user/user.route.js';
import childRouter from "./child/child.route.js";
import routineRouter from "./routine/routine.route.js";
import alertRouter from "./alert/alert.route.js";
import healthRouter from "./health/health.route.js";
import deviceRouter from "./device/device.route.js";
import locationRouter from "./location/location.route.js";
import geofenceRouter from "./geofence/geofence.route.js";
import aiRouter from "./ai/ai.route.js";
import { verifyToken } from "./middleware/auth.middleware.js";
import dotenv from 'dotenv';
import "./models.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Allow requests from the React frontend
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000', '*'],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

// Parse JSON and URL-encoded request bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API routes
app.use('/api/users', userRouter);
app.use('/api/children', childRouter);
app.use('/api/routines', routineRouter);
app.use('/api/alerts', alertRouter);
app.use('/api/health', healthRouter);
app.use('/api/devices', deviceRouter);
app.use('/api/locations', locationRouter);
app.use('/api/geofences', geofenceRouter);
app.use('/api/ai', verifyToken, aiRouter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ message: 'GuardianBand backend is running', status: 'ok' });
});

// 404 handler for unknown routes
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, async () => {
  try {
    await connectDB();
    await sequelize.sync({ force: false, alter: true });
    console.log('Database synced successfully');
    console.log(`GuardianBand backend running on http://localhost:${PORT}`);
  } catch (error) {
    console.error('Failed to start server:', error);
  }
});
