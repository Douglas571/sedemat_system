'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class BusinessActivityCategory extends Model {
    static associate(models) {
      BusinessActivityCategory.hasMany(models.Business, { 
        foreignKey: 'businessActivityCategoryId', 
        as: 'businesses'
      });
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