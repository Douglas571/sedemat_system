'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class CurrencyExchangeRates extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  CurrencyExchangeRates.init({
    dolarBCVToBs: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    eurosBCVToBs: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    dolarBlackToBs: {
      type: DataTypes.FLOAT,
      // allowNull: false,
    },
    euroBlackToBs: {
      type: DataTypes.FLOAT,
      // allowNull: false,
    },
  }, {
    sequelize,
    modelName: 'CurrencyExchangeRates',
  });
  return CurrencyExchangeRates;
};