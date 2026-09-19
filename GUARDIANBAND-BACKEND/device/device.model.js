import { DataTypes } from "sequelize";
import { sequelize } from "../db.connect.js";

const Device = sequelize.define("Device", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "GuardianBand",
    },
    hardwareId: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    battery: {
        type: DataTypes.INTEGER,
        defaultValue: 100,
    },
    gsm: {
        type: DataTypes.STRING,
        defaultValue: "Good",
    },
    firmware: {
        type: DataTypes.STRING,
        defaultValue: "v2.0.0",
    },
    childId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    apiKey: {
        type: DataTypes.STRING(128),
        allowNull: true,
        unique: true,
    },
    activity: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    connectivity: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    signal: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    lastSeen: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    tampered: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
    sos: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
});

export default Device;
