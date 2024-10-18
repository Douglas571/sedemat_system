'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class PenaltyType extends Model {
    static associate(models) {
      
      PenaltyType.hasMany(models.Penalty, {
        foreignKey: 'penaltyTypeId',
        as: 'penalties'
      })

    }
  }

  PenaltyType.init({
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    defaultAmountMMVBCV: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    createdAt: {
      allowNull: false,
      type: DataTypes.DATE
    },
    updatedAt: {
      allowNull: false,
      type: DataTypes.DATE
    }
  }, {
    sequelize,
    modelName: 'PenaltyType',
    tableName: 'PenaltyTypes',
  });

  return PenaltyType;
};
