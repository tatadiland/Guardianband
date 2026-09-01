import { DataTypes } from "sequelize";
import { sequelize } from "../db.connect.js";
import Child from "../child/child.model.js";

const Routine = sequelize.define("Routine", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    category: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    start: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    end: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    description: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    status: {
        type: DataTypes.ENUM("completed", "in-progress", "upcoming", "missed"),
        defaultValue: "upcoming",
    },
    icon: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    childId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
});

export default Routine;
