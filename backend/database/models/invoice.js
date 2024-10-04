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
      const {InvoiceItem, EconomicLicense} = models

      // Invoice has many item type
      Invoice.hasMany(InvoiceItem, {
        foreignKey: 'invoiceId',
        as: 'invoiceItems'
      })

      // Invoice can have one economic license 
      Invoice.hasOne(EconomicLicense, {
        foreignKey: 'invoiceId',
        as: 'economicLicense'
      })

    }
  }
  Invoice.init({
    finalExchangeRatesId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
          model: 'CurrencyExchangeRates', // Reference the CurrencyExchangeRates table
          key: 'id'
      },

      // Deprecated
      isPaid: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: false
      }
    },
  }, {
    sequelize,
    modelName: 'Invoice',
  });
  return Invoice;
};

// TODO: Continue developing the model...