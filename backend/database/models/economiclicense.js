'use strict';

const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class EconomicLicense extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      const {EconomicActivity, Invoice} = models

      EconomicLicense.belongsTo(EconomicActivity, {
          foreignKey: "economicActivityId",
      });
      
      EconomicActivity.hasMany(EconomicLicense, {
          foreignKey: "economicActivityId",
      })

      // economic license belongs to one invoice
      EconomicLicense.belongsTo(Invoice, {
        foreignKey: 'invoiceId',
        as: 'invoice'
      })
    
    }
  }
  EconomicLicense.init({

    createdByPersonId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'People',
        key: 'id'
      }
    },

    checkedByPersonId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'People',
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

    // This column is for data convenience, instead of fetching 
    // all invoices and payment allocations to check if a license
    // isPaid every time, I just set this column once.
    isPaid: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },

    // isSuspended is similar to is paid, just convenience.
    isSuspended: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },


    openAt: {
      type: DataTypes.TIME,
      // allowNull: false,
    },
    closeAt: {
      type: DataTypes.TIME,
      // allowNull: false
    },

    issuedDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    expirationDate: {
      type: DataTypes.DATE,
      allowNull: false,
    }

  }, {
    sequelize,
    modelName: 'EconomicLicense',
  });

  return EconomicLicense;
};