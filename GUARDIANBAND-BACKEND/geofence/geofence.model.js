import { DataTypes } from "sequelize";
import { sequelize } from "../db.connect.js";

const Geofence = sequelize.define("Geofence", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "Safe Zone",
    },
    latitude: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },
    longitude: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },
    radius: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 200,
        comment: "Radius in meters",
    },
    childId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
});

export default Geofence;
