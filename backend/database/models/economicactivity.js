'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class EconomicActivity extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  EconomicActivity.init({
    code: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    alicuota: {
        type: DataTypes.DECIMAL(5, 2), // Tax percentage
        allowNull: false,
    },
    minimumTax: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    }
  }, {
    sequelize,
    modelName: 'EconomicActivity',
  });
  return EconomicActivity;
};