import { DataTypes } from "sequelize";
import { sequelize } from "../db.connect.js";

const Alert = sequelize.define("Alert", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    category: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    severity: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    time: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    unread: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    },
    childId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
});

export default Alert;
