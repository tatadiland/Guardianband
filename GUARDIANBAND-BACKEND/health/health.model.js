import { DataTypes } from "sequelize";
import { sequelize } from "../db.connect.js";

const Health = sequelize.define("Health", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    heartRate: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    temperature: {
        type: DataTypes.FLOAT,
        allowNull: true,
    },
    childId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
});

export default Health;
