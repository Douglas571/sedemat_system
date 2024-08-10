'use strict';
const {
  Model
} = require('sequelize');
module.exports = (DataTypes, DataTypes) => {
  class Business extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of DataTypes lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
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

    createdAt: {
      allowNull: false,
      type: DataTypes.DATE
    },
    updatedAt: {
      allowNull: false,
      type: DataTypes.DATE
    }
  }, {
    DataTypes,
    modelName: 'Business',
  });
  return Business;
};