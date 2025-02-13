'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Payment extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here

      const {Business, Person, Bank, User} = models

      Payment.belongsTo(Person, {
        foreignKey: 'personId',
        as: 'person'
      })

      Payment.belongsTo(Business, {
        foreignKey: 'businessId',
        as: 'business'
      })

      Payment.belongsTo(Bank, {
        foreignKey: 'bankId',
        as: 'bank'
      })

      Payment.belongsTo(models.GrossIncomeInvoice, {
        foreignKey: 'grossIncomeInvoiceId',
        as: 'grossIncomeInvoice'
      })

      Payment.belongsTo(User, {
        foreignKey: 'createdByUserId',
        as: 'createdByUser',
      })

      Payment.belongsTo(User, {
        foreignKey: 'updatedByUserId',
        as: 'updatedByUser',
      })

    }
  }
  Payment.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    dni: DataTypes.STRING,
    amount: DataTypes.DECIMAL,
    account: DataTypes.STRING,
    reference: {
        type: DataTypes.STRING,
        unique: true
    },
    paymentDate: DataTypes.DATE,
    image: DataTypes.STRING ,
    state: DataTypes.STRING,
    businessName: DataTypes.STRING,
    isVerified: {
      type: DataTypes.BOOLEAN,
      get() {
        if (this.checkedAt && this.checkedByUserId) {
          return true
        }

        return false
      }
    },
    // add liquidation date
    // add state 

    bankId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Backs',
        key: 'id'
      }
    },

    businessId: {
      type: DataTypes.INTEGER,
      references: {
          model: 'Businesses', // Name of the related table
          key: 'id'
      },
      // onDelete: 'CASCADE',
      // onUpdate: 'CASCADE',
    },

    personId: {
      type: DataTypes.INTEGER,
      //allowNull: false, // just for now...
      references: {
        model: 'People',
        key: 'id'
      },
      // onDelete: 'CASCADE',
      // onUpdate: 'CASCADE',
    },

    grossIncomeInvoiceId: {
      type: DataTypes.INTEGER,
      reference: {
        model: 'GrossIncomeInvoices',
        key: 'id'
      }
    },

    checkedByUserId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Users',
        key: 'id'
      },
    },

    // this is used to know when the payment was marked as checked
    checkedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    // this is used to know when the payment was actually received in sedemat accounts
    receivedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    createdByUserId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Users',
        key: 'id',
      },
    },
    updatedByUserId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Users',
        key: 'id',
      },
    },

  }, {
    sequelize,
    modelName: 'Payment',
  });

  return Payment;
};