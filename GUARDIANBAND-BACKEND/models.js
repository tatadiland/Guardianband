import User from "./user/user.model.js";
import Child from "./child/child.model.js";
import Routine from "./routine/routine.model.js";
import Alert from "./alert/alert.model.js";
import Health from "./health/health.model.js";
import Device from "./device/device.model.js";
import Location from "./location/location.model.js";
import Geofence from "./geofence/geofence.model.js";

// User <-> Child
User.hasOne(Child, { foreignKey: "userId", onDelete: "CASCADE" });
Child.belongsTo(User, { foreignKey: "userId" });

// Child <-> Routine
Child.hasMany(Routine, { foreignKey: "childId", onDelete: "CASCADE" });
Routine.belongsTo(Child, { foreignKey: "childId" });

// Child <-> Alert
Child.hasMany(Alert, { foreignKey: "childId", onDelete: "CASCADE" });
Alert.belongsTo(Child, { foreignKey: "childId" });

// Child <-> Health
Child.hasMany(Health, { foreignKey: "childId", onDelete: "CASCADE" });
Health.belongsTo(Child, { foreignKey: "childId" });

// Child <-> Device (one device per child)
Child.hasOne(Device, { foreignKey: "childId", onDelete: "CASCADE" });
Device.belongsTo(Child, { foreignKey: "childId" });

// Device <-> Location
Device.hasMany(Location, { foreignKey: "deviceId", onDelete: "CASCADE" });
Location.belongsTo(Device, { foreignKey: "deviceId" });

// Child <-> Geofence (one geofence per child)
Child.hasOne(Geofence, { foreignKey: "childId", onDelete: "CASCADE" });
Geofence.belongsTo(Child, { foreignKey: "childId" });

export { User, Child, Routine, Alert, Health, Device, Location, Geofence };