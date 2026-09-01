import { DataTypes } from "sequelize";
import { sequelize } from "../db.connect.js";

const Location = sequelize.define("Location", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    latitude: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },
    longitude: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },
    deviceId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
});

export default Location;
