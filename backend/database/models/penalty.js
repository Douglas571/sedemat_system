'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Penalty extends Model {
    static associate(models) {
      Penalty.belongsTo(models.PenaltyType, {
        foreignKey: 'penaltyTypeId',
        as: 'penaltyType'
      })

      Penalty.belongsTo(models.GrossIncomeInvoice, {
        foreignKey: 'grossIncomeInvoiceId',
        as: 'grossIncomeInvoice'
      })

      // TODO: Move these relationships to their models
      models.GrossIncomeInvoice.hasMany(Penalty, {
        foreignKey: 'grossIncomeInvoiceId',
        as: 'penalties'
      })

      // ? Should i add this?
      // ? I mean, penalties are related to invoice, and invoice 
      // ? as a createdByUser, only the creator of an invoice should edit 
      // ? the penalties associated to that invoice, right?
      Penalty.belongsTo(models.User, {
        foreignKey: 'createdByUserId',
        as: 'createdByUser'
      })

      Penalty.belongsTo(models.User, {
        foreignKey: 'revokedByUserId',
        as: 'revokedByUser'
      })
    }
  }

  Penalty.init({
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    penaltyTypeId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    amountMMVBCV: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
    },
    createdByUserId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    revokedByUserId: {
      type: DataTypes.INTEGER,
    },
    revocationReason: {
      type: DataTypes.STRING,
    },
    revokedAt: {
      type: DataTypes.DATE,
    },
    createdAt: {
      allowNull: false,
      type: DataTypes.DATE
    },
    updatedAt: {
      allowNull: false,
      type: DataTypes.DATE
    }
  }, {
    sequelize,
    modelName: 'Penalty',
    tableName: 'Penalties',
  });

  return Penalty;
};
