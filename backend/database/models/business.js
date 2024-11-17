'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Business extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of DataTypes lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      const {EconomicActivity, Person, CertificateOfIncorporation, EconomicLicense} = models

      Business.belongsTo(EconomicActivity, {
          foreignKey: "economicActivityId",
          as: 'economicActivity'
      })
      
      EconomicActivity.hasMany(Business, {
          foreignKey: "economicActivityId"
      })

      Business.belongsTo(Person, {
        foreignKey: "ownerPersonId",
        as: 'owner'
      })
      
      Business.belongsTo(Person, {
          foreignKey: "accountantPersonId",
          as: 'accountant'
      })
      
      Business.belongsTo(Person, {
          foreignKey: "administratorPersonId",
          as: 'administrator'
      })
      
      Person.hasMany(Business, {
          foreignKey: "ownerPersonId"
      })

      // business has a relationship one to many with certificateOfIncorporation
      Business.hasMany(CertificateOfIncorporation, {
        foreignKey: "businessId",
        as: 'certificateOfIncorporations'
      })

      // business has many economicLicenses
      Business.hasMany(EconomicLicense, {
        foreignKey: "businessId",
        as: 'economicLicenses'
      })

      Business.hasMany(models.BranchOffice, {
        foreignKey: "businessId",
        as: 'branchOffices'
      }),

      Business.hasMany(models.GrossIncome, {
        foreignKey: "businessId",
        as: 'grossIncomes'
      })

      Business.hasMany(models.InactivityPeriod, {
        foreignKey: "businessId",
        as: 'inactivityPeriods'
      })

      Business.belongsTo(models.User, {
        foreignKey: 'fiscalId',
        as: 'fiscal'
      })

      Business.belongsTo(models.BusinessActivityCategory, {
        foreignKey: 'businessActivityCategoryId',
        as: 'businessActivityCategory'
      })
    }
  }
  Business.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    businessName: {
        type: DataTypes.STRING,
        unique: true
    },
    dni: DataTypes.STRING, 
    email: DataTypes.STRING,
    companyIncorporationDate: DataTypes.DATE,
    companyExpirationDate: DataTypes.DATE,
    directorsBoardExpirationDate: DataTypes.DATE,
    
    economicActivityId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'EconomicActivity',
            key: 'id'
        }
    },
    
    ownerPersonId: {
        type: DataTypes.INTEGER,
        //allowNull: false, // just for now...
        references: {
            model: 'Person', 
            key: 'id'
        }
    },

    accountantPersonId: {
        type: DataTypes.INTEGER,
        //allowNull: false, // just for now...
        references: {
            model: 'Person', 
            key: 'id'
        }
    },

    administratorPersonId: {
        type: DataTypes.INTEGER,
        //allowNull: false, // just for now...
        references: {
            model: 'Person', 
            key: 'id'
        }
    },

    preferredChannel: DataTypes.STRING,
    sendCalculosTo: DataTypes.STRING,
    preferredContact: DataTypes.STRING,

    reminderInterval: DataTypes.INTEGER,

    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },

    fiscalId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Users',
        key: 'id'
      }
    },

    businessActivityCategoryId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'BusinessActivityCategory',
        key: 'id'
      }
    },

    createdAt: {
      allowNull: false,
      type: DataTypes.DATE
    },
    updatedAt: {
      allowNull: false,
      type: DataTypes.DATE
    }
  }, {
    sequelize,
    modelName: 'Business',
  });
  return Business;
};