'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class PermitDoc extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here

      PermitDoc.hasMany(models.DocImage, {
        foreignKey: 'permitDocId',
        as: 'permitDoc'
      });

      PermitDoc.belongsTo(models.BranchOffice, {
        foreignKey: "branchOfficeId"
      });

      PermitDoc.hasMany(models.DocImage, {
        foreignKey: 'permitDocId',
        as: 'docImages'
      });
    }
  }
  PermitDoc.init({
    expirationDate: DataTypes.DATE,

    type: {
      allowNull: false,
      type: DataTypes.ENUM('FIRE', 'HEALTH')
    },

    branchOfficeId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'BranchOffices',
        key: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    }

  }, {
    sequelize,
    modelName: 'PermitDoc',
  });
  return PermitDoc;
};