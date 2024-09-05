'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class PaymentAllocation extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Define associations here
      const { Invoice, Payment } = models;

      PaymentAllocation.belongsTo(Invoice, {
        foreignKey: 'invoiceId',
        as: 'invoice',
      });

      PaymentAllocation.belongsTo(Payment, {
        foreignKey: 'paymentId',
        as: 'payment',
      });
    }
  }
  PaymentAllocation.init({
    invoiceId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Invoices',
        key: 'id',
      }
    },
    paymentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Payments',
        key: 'id',
      }
    },
    amountBs: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
  }, {
    sequelize,
    modelName: 'PaymentAllocation',
  });
  return PaymentAllocation;
};