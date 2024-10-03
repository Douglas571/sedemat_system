'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Alicuota extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here

      Alicuota.belongsTo(models.EconomicActivity, {
        foreignKey: 'economicActivityId',
        as: 'economicActivity',
      });

      Alicuota.hasMany(models.GrossIncome, {
        foreignKey: 'alicuotaId',
        as: 'grossIncomes',
      });
    }
  }
  Alicuota.init({
    economicActivityId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'EconomicActivity', // assuming you have an EconomicActivity model
        key: 'id',
      },
    },
    taxPercent: {
      type: DataTypes.DECIMAL(5, 4), // Adjust size and precision as needed
      allowNull: false,
    },
    minTaxMMV: {
      type: DataTypes.DECIMAL(10, 2), // Adjust size and precision as needed
      allowNull: false,
    },
  }, {
    sequelize,
    tableName: 'Alicuotas',
    modelName: 'Alicuota',
  });
  return Alicuota;
};