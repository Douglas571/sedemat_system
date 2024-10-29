'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class InactivityPeriod extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      InactivityPeriod.belongsTo(models.BranchOffice, {
        foreignKey: 'branchOfficeId',
        as: 'branchOffice'
      });
    }
  }
  InactivityPeriod.init({
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    startAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    endAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    comment: {
      type: DataTypes.STRING,
      defaultValue: '',
    },
    businessId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Businesses',
        key: 'id',
      },
    },
    branchOfficeId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'BranchOffices',
        key: 'id',
      },
    },
  }, {
    sequelize,
    modelName: 'InactivityPeriod',
  });
  return InactivityPeriod;
};