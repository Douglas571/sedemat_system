'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class DocImage extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      const {Zonation, LeaseDoc, BuildingDoc, PermitDoc} = models
      DocImage.belongsTo(Zonation, {
        foreignKey: "zonationId",
        as: "zonation"
      })
      DocImage.belongsTo(LeaseDoc, {
        foreignKey: "leaseDocId",
        as: 'leaseDoc'
      });
      DocImage.belongsTo(BuildingDoc, {
        foreignKey: "buildingDocId",
        as: 'buildingDoc'
      });

      DocImage.belongsTo(PermitDoc, {
        foreignKey: 'permitDocId',
        as: 'permitDoc'
      });
    }
  }
  DocImage.init({
    pageNumber: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    url: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    zonationId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Zonations',
        key: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
    leaseDocId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'LeaseDocs',
        key: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
    buildingDocId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'BuildingDocs',
        key: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },

    permitDocId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Permissions',
        key: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    },
  }, {
    sequelize,
    modelName: 'DocImage',
  });
  return DocImage;
};