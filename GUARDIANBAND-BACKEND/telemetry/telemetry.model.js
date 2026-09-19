import { DataTypes } from "sequelize";
import { sequelize } from "../db.connect.js";

const Telemetry = sequelize.define("Telemetry", {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    deviceId: { type: DataTypes.INTEGER, allowNull: false },
    eventId: { type: DataTypes.STRING(160), allowNull: false, unique: true },
    latitude: { type: DataTypes.FLOAT, allowNull: true },
    longitude: { type: DataTypes.FLOAT, allowNull: true },
    heartRate: { type: DataTypes.INTEGER, allowNull: true },
    bodyTemperature: { type: DataTypes.FLOAT, allowNull: true },
    activity: { type: DataTypes.STRING, allowNull: true },
    acceleration: { type: DataTypes.JSON, allowNull: true },
    battery: { type: DataTypes.INTEGER, allowNull: true },
    connectivity: { type: DataTypes.STRING, allowNull: true },
    signal: { type: DataTypes.STRING, allowNull: true },
    tampered: { type: DataTypes.BOOLEAN, allowNull: true },
    sos: { type: DataTypes.BOOLEAN, allowNull: true },
    recordedAt: { type: DataTypes.DATE, allowNull: false },
}, { tableName: "telemetry", timestamps: true });

export default Telemetry;