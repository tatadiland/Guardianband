import { DataTypes } from 'sequelize';

export default function defineDeviceModel(sequelize) {
  const Device = sequelize.define(
    'Device',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      childId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      hardwareId: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true,
      },
      battery: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      gsm: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      gps: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      firmware: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      updatedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      timestamps: true,
      tableName: 'devices',
    }
  );

  return Device;
}
