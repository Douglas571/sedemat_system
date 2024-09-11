'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class GrossIncome extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      GrossIncome.belongsTo(models.BranchOffice, {
        foreignKey: 'branchOfficeId',
        as: 'branchOffice'
      });

      GrossIncome.belongsTo(models.CurrencyExchangeRates, {
        foreignKey: 'currencyExchangeRatesId',
        as: 'currencyExchangeRate'
      });

      GrossIncome.belongsTo(models.WasteCollectionTax, {
        foreignKey: 'wasteCollectionTaxId',
        as: 'wasteCollectionTax'
      });

      GrossIncome.belongsTo(models.GrossIncomeInvoice, {
        foreignKey: 'grossIncomeInvoiceId',
        as: 'grossIncomeInvoice'
      });
    }
    
  }
  GrossIncome.init({
    businessId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    branchOfficeId: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    period: {
      type: DataTypes.DATE,
      allowNull: false
    },
    amountBs: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false
    },
    chargeWasteCollection: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    },
    declarationImage: {
      type: DataTypes.STRING,
      allowNull: false
    },

    currencyExchangeRatesId: {
      type: DataTypes.INTEGER,
      allowNull: true
    },

    wasteCollectionTaxId: {
      type: DataTypes.INTEGER,
      allowNull: true
    },

    
    grossIncomeInvoiceId: {
      type: DataTypes.INTEGER,
      allowNull: true
    },

  }, {
    sequelize,
    modelName: 'GrossIncome',
  });
  return GrossIncome;
};