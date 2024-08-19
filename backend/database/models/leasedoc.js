'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class LeaseDoc extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Define associations
      const { DocImage } = models;
      LeaseDoc.hasMany(DocImage, {
        foreignKey: "leaseDocId",
        as: 'docImages'
      });
      LeaseDoc.belongsTo(models.BranchOffice, {
        foreignKey: "branchOfficeId",
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      });
    }
  }
  LeaseDoc.init({
    expirationDate: {
      type: DataTypes.DATE,
      allowNull: false
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
    modelName: 'LeaseDoc',
  });
  return LeaseDoc;
};