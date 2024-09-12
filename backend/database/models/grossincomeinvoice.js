'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class GrossIncomeInvoice extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here

      GrossIncomeInvoice.hasMany(models.GrossIncome, {
        foreignKey: 'grossIncomeInvoiceId',
        as: 'grossIncomes'
      })

    }
  }
  GrossIncomeInvoice.init({
    // isPaid: {
    //   type: DataTypes.BOOLEAN,
    //   allowNull: false,
    //   defaultValue: false
    // },

    businessId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Business',
        key: 'id'
      }
    },

    formPriceBs: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0
    },

    paidAt: {
      type: DataTypes.DATE,
      allowNull: true 
    },

    totalBs: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0
    }
  }, {
    sequelize,
    modelName: 'GrossIncomeInvoice',
  });
  return GrossIncomeInvoice;
};