'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class BusinessActivityCategory extends Model {
    static associate(models) {
      // Define associations here, if any
    }
  }
  BusinessActivityCategory.init(
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'BusinessActivityCategory',
    }
  );
  return BusinessActivityCategory;
};