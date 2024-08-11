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
    // don't add the timestamp attributes (updatedAt, createdAt)
    // add liquidation date
    // add state 
  }, {
    sequelize,
    modelName: 'Payment',
  });

  return Payment;
};