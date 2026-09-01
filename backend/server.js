import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import path from 'path';
import { fileURLToPath } from 'url';
import sequelize from './db.connect.js';
import defineUserModel from './user/user.model.js';
import defineChildModel from './child/child.model.js';
import defineRoutineModel from './routine/routine.model.js';
import defineAlertModel from './alert/alert.model.js';
import defineHealthModel from './health/health.model.js';
import defineDeviceModel from './device/device.model.js';
import defineLocationModel from './location/location.model.js';
import defineGeofenceModel from './geofence/geofence.model.js';
import { createUserRouter } from './user/user.route.js';
import { createChildRouter } from './child/child.route.js';
import { createRoutineRouter } from './routine/routine.route.js';
import { createAlertRouter } from './alert/alert.route.js';
import { createHealthRouter } from './health/health.route.js';
import { createDeviceRouter } from './device/device.route.js';
import { createLocationRouter } from './location/location.route.js';
import { createGeofenceRouter } from './geofence/geofence.route.js';
import { createAIRouter } from './ai/ai.route.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Serve uploads directory statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Initialize models
const User = defineUserModel(sequelize);
const Child = defineChildModel(sequelize);
const Routine = defineRoutineModel(sequelize);
const Alert = defineAlertModel(sequelize);
const Health = defineHealthModel(sequelize);
const Device = defineDeviceModel(sequelize);
const Location = defineLocationModel(sequelize);
const Geofence = defineGeofenceModel(sequelize);

// Make models available globally for controllers
global.User = User;
global.Child = Child;
global.Routine = Routine;
global.Alert = Alert;
global.Health = Health;
global.Device = Device;
global.Location = Location;
global.Geofence = Geofence;

// Sync database
sequelize
  .sync({ alter: true })
  .then(() => {
    console.log('Database synced successfully');
  })
  .catch((error) => {
    console.error('Database sync error:', error);
  });

// Routes
app.use('/api/users', createUserRouter(User));
app.use('/api/children', createChildRouter(Child));
app.use('/api/routines', createRoutineRouter(Routine));
app.use('/api/alerts', createAlertRouter(Alert));
app.use('/api/health', createHealthRouter(Health));
app.use('/api/devices', createDeviceRouter(Device));
app.use('/api/locations', createLocationRouter(Location));
app.use('/api/geofences', createGeofenceRouter(Geofence));
app.use('/api/ai', createAIRouter());

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ message: 'Server is running' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
