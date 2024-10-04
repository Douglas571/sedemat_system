'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Settlement extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      const { User, GrossIncomeInvoice } = models;

      // Settlement belongs to a person who checks it
      Settlement.belongsTo(User, {
        foreignKey: 'settledByUserId',
        as: 'settledByUser'
      });

      // Settlement belongs to a gross income invoice
      Settlement.belongsTo(GrossIncomeInvoice, {
        foreignKey: 'grossIncomeInvoiceId',
        as: 'grossIncomeInvoice'
      });
    }
  }

  Settlement.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },

    settledAt: {
      type: DataTypes.DATE,
      allowNull: false
    },

    code: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },

    settledByUserId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    },

    grossIncomeInvoiceId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'GrossIncomeInvoices', // Assuming your GrossIncomeInvoice model's table name
        key: 'id'
      },
      unique: true
    },
  }, {
    sequelize,
    modelName: 'Settlement',
    timestamps: true // Enable if you need `createdAt` and `updatedAt` fields
  });

  return Settlement;
};