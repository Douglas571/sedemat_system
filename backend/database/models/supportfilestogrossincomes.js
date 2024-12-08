// models/SupportFilesToGrossIncomes.js
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class SupportFilesToGrossIncomes extends Model {
    static associate(models) {
      
    }
  }

  SupportFilesToGrossIncomes.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      grossIncomeId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'GrossIncomes',
          key: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      fileId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
        references: {
          model: 'Files',
          key: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
    },
    {
      sequelize,
      modelName: 'SupportFilesToGrossIncomes',
      tableName: 'SupportFilesToGrossIncomes',
      timestamps: true, // Includes createdAt and updatedAt
    }
  );

  return SupportFilesToGrossIncomes;
};