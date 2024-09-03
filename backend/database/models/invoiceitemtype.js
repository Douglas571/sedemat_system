'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class InvoiceItemType extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  InvoiceItemType.init({
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    defaultAmountMMV: {
        type: DataTypes.FLOAT,
        allowNull: false
    }
  }, {
    sequelize,
    modelName: 'InvoiceItemType',
  });
  return InvoiceItemType;
};