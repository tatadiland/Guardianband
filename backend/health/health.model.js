import { DataTypes } from 'sequelize';

export default function defineHealthModel(sequelize) {
  const Health = sequelize.define(
    'Health',
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
      heartRate: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      temperature: {
        type: DataTypes.FLOAT,
        allowNull: true,
      },
      oxygenLevel: {
        type: DataTypes.FLOAT,
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
      tableName: 'health_records',
    }
  );

  return Health;
}
