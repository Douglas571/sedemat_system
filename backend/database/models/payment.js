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

      const {Business, Person, Bank } = models

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
    }
  }
  Payment.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    dni: DataTypes.STRING,
    amount: DataTypes.STRING,
    account: DataTypes.STRING,
    reference: {
        type: DataTypes.STRING,
        unique: true
    },
    paymentDate: DataTypes.DATE,
    image: DataTypes.STRING ,
    state: DataTypes.STRING,
    businessName: DataTypes.STRING,
    isVerified: DataTypes.BOOLEAN,
    // add liquidation date
    // add state 

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


  }, {
    sequelize,
    modelName: 'Payment',
  });

  return Payment;
};