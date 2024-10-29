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
        Zonation, 
        BuildingDoc, 
        LeaseDoc
      } = models
      // define association here

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
        as: "fireFighterDocs",

        scope: {
          type: 'FIRE'
        }
      })

      BranchOffice.hasMany(models.PermitDoc, {
        foreignKey: "branchOfficeId",
        as: "healthPermitDocs",

        scope: {
          type: 'HEALTH'
        }
      })

      BranchOffice.hasMany(models.WasteCollectionTax, {
        foreignKey: "branchOfficeId",
        as: "wasteCollectionTaxes"
      })

      BranchOffice.belongsTo(models.Business, {
        foreignKey: "businessId",
        as: "business"
      })

      BranchOffice.hasMany(models.GrossIncome, {
        foreignKey: "branchOfficeId",
        as: "grossIncomes"
      })

      BranchOffice.hasMany(models.InactivityPeriod, {
        foreignKey: "branchOfficeId",
        as: "inactivityPeriods"
      })
    }
  }
  BranchOffice.init({
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    nickname: {
      type: DataTypes.STRING,
      allowNull: false,
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
    },

    chargeWasteCollection: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },

    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },

  }, {
    sequelize,
    modelName: 'BranchOffice',
  });
  return BranchOffice;
};