'use strict';
const {
  Model
} = require('sequelize');
const permitdoc = require('./permitdoc');
module.exports = (sequelize, DataTypes) => {
  class BranchOffice extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      const {
        EconomicLicense, 
        Zonation, 
        BuildingDoc, 
        LeaseDoc
      } = models
      // define association here
      BranchOffice.hasMany(EconomicLicense, {
        foreignKey: "branchOfficeId",
        as: "economicLicenses"
      })

      BranchOffice.hasMany(Zonation, {
        foreignKey: "branchOfficeId",
        as: "zonations"
      })

      BranchOffice.hasMany(BuildingDoc, {
        foreignKey: "branchOfficeId",
        as: "buildingDocs"
      })

      BranchOffice.hasMany(LeaseDoc, {
        foreignKey: "branchOfficeId",
        as: "leaseDocs"
      })

      BranchOffice.hasMany(models.PermitDoc, {
        foreignKey: "branchOfficeId",
        as: "fireFighterDocs"
      })

      BranchOffice.hasMany(models.PermitDoc, {
        foreignKey: "branchOfficeId",
        as: "healthPermitDocs"
      })
    }
  }
  BranchOffice.init({
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    address: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    phone: {
        type: DataTypes.STRING
    },
    businessId: {
        type: DataTypes.INTEGER,
        references: {
            model: 'Businesses', // Name of the related table
            key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
    },
    zone: DataTypes.STRING,
    dimensions: DataTypes.INTEGER,
    type: DataTypes.STRING, // it can be I, II, III

    isRented: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  }, {
    sequelize,
    modelName: 'BranchOffice',
  });
  return BranchOffice;
};