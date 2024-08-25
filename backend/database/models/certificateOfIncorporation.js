'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class CertificateOfIncorporation extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Certified has a relationship many to onw with Bussiness
      const { Business } = models;
      CertificateOfIncorporation.belongsTo(Business, {
        foreignKey: "businessId",
        as: 'business'
      });

      // Certified has a relationship one to many with DocImages
      const { DocImage } = models;
      CertificateOfIncorporation.hasMany(DocImage, {
        foreignKey: "certificateOfIncorporationId",
        as: 'docImages'
      });
    }
  }
  CertificateOfIncorporation.init({

    expirationDate: {
      type: DataTypes.DATE
    },

    businessId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Businesses',
        key: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    },

  }, {
    sequelize,
    modelName: 'CertificateOfIncorporation',
  });
  return CertificateOfIncorporation;
};