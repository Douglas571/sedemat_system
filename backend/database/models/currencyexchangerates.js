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
      CurrencyExchangeRates.hasMany(models.GrossIncome, {
        foreignKey: 'currencyExchangeRatesId',
        as: 'grossIncomes'
      });
    }
  }
  CurrencyExchangeRates.init({
    dolarBCVToBs: {
      type: DataTypes.DECIMAL(6, 2),
      allowNull: false,
    },
    eurosBCVToBs: {
      type: DataTypes.DECIMAL(6, 2),
      allowNull: false,
    },
    dolarBlackToBs: {
      type: DataTypes.DECIMAL(6, 2),
      // allowNull: false,
    },
    euroBlackToBs: {
      type: DataTypes.DECIMAL(6, 2),
      // allowNull: false,
    },

  }, {
    sequelize,
    modelName: 'CurrencyExchangeRates',
  });
  return CurrencyExchangeRates;
};