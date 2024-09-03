'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class InvoiceItem extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      const { Invoice, InvoiceItemType } = models

      // Invoice item belongs to one invoice item type
      Invoice.belongsTo(InvoiceItemType, {
        foreignKey: 'invoiceItemTypeId',
        as: 'invoiceItemType'
      })

      // Invoice item belongs to invoice 
      InvoiceItem.belongsTo(Invoice, {
        foreignKey: 'invoiceId',
        as: 'invoice'
      });
    }
  }
  InvoiceItem.init({
    invoiceItemTypeId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
          model: 'InvoiceItemTypes',
          key: 'id'
      }
    },
    invoiceId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Invoices',
            key: 'id'
        }
    },
    amountMMV: {
        type: DataTypes.FLOAT,
        allowNull: false
    }
  }, {
    sequelize,
    modelName: 'InvoiceItem',
  });
  return InvoiceItem;
};