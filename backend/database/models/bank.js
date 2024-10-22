'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Bank extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here

      const { Payment } = models;
      // Bank has many payments associated
      Bank.hasMany(Payment, { foreignKey: 'bankId', as: 'payments' });

      Bank.hasMany(models.GrossIncomeInvoice, { foreignKey: 'firstBankAccountId', as: 'grossIncomeInvoicesFirstBankAccount' });

      Bank.hasMany(models.GrossIncomeInvoice, { foreignKey: 'secondBankAccountId', as: 'grossIncomeInvoicesSecondBankAccount' });
    }
  }
  Bank.init({
    accountNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    }, 
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    isSavingAccount: {
      type: DataTypes.BOOLEAN,
      allowNull: false, 
      defaultValue: false,
    }
  }, {
    sequelize,
    modelName: 'Bank',
  });
  return Bank;
};