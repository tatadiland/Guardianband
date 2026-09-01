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
});

export default Device;
