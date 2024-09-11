'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class WasteCollectionTax extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      WasteCollectionTax.belongsTo(models.BranchOffice, {
        foreignKey: 'branchOfficeId',
        as: 'branchOffice'
      });
      
    }
  }
  WasteCollectionTax.init({

  branchOfficeId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },

  period: {
    type: DataTypes.DATE,
    allowNull: false
  },

  }, {
    sequelize,
    modelName: 'WasteCollectionTax',
  });
  return WasteCollectionTax;
};