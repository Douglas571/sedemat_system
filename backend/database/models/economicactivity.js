'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class EconomicActivity extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here

      EconomicActivity.hasMany(models.Alicuota, {
        foreignKey: 'economicActivityId',
        as: 'alicuotaHistory'
      })

      EconomicActivity.hasMany(models.Business, {
        foreignKey: 'economicActivityId',
        as: 'businesses'
      })
    }
  }
  EconomicActivity.init({
    code: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    alicuota: {
        type: DataTypes.FLOAT, // Tax percentage
        allowNull: false,
    },
    minimumTax: {
        // in MMV
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    }
  }, {
    sequelize,
    modelName: 'EconomicActivity',
  });
  return EconomicActivity;
};