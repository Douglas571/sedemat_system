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
      type: DataTypes.DECIMAL,
      allowNull: false,
    },
    eurosBCVToBs: {
      type: DataTypes.DECIMAL,
      allowNull: false,
    },
    dolarBlackToBs: {
      type: DataTypes.DECIMAL,
      // allowNull: false,
    },
    euroBlackToBs: {
      type: DataTypes.DECIMAL,
      // allowNull: false,
    },
    
  }, {
    sequelize,
    modelName: 'CurrencyExchangeRates',
  });
  return CurrencyExchangeRates;
};