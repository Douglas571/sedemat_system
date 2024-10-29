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
      // define association here
      
    }
  }
  inactivityPeriod.init({
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    startAt: {
      type: Sequelize.DATE,
      allowNull: false,
    },
    endAt: {
      type: Sequelize.DATE,
      allowNull: true,
    },
    comment: {
      type: Sequelize.STRING,
      defaultValue: '',
    },
    businessId: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'Businesses',
        key: 'id',
      },
    },
    branchOfficeId: {
      type: Sequelize.INTEGER,
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
  return inactivityPeriod;
};