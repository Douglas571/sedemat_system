'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Invoice extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Invoice.init({
    finalExchangeRatesId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
          model: 'CurrencyExchangeRates', // Reference the CurrencyExchangeRates table
          key: 'id'
      }
    }
  }, {
    sequelize,
    modelName: 'Invoice',
  });
  return Invoice;
};

// TODO: Continue developing the model...