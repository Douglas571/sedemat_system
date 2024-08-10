'use strict';

const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class EconomicLicense extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({EconomicActivity}) {
      // define association here

      EconomicLicense.belongsTo(EconomicActivity, {
          foreignKey: "economicActivityId",
      });
      
      EconomicActivity.hasMany(EconomicLicense, {
          foreignKey: "economicActivityId",
      });
    }
  }
  EconomicLicense.init({
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    
    branchOfficeId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
          model: "BranchOffices", // Adjust this to your actual model name
          key: "id",
      },
      allowNull: false,
    },
    economicActivityId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
          model: "EconomicActivity", // Adjust this to your actual model name
          key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
    openAt: {
      type: DataTypes.TIME,
      // allowNull: false,
    },
    closeAt: {
      type: DataTypes.TIME,
      // allowNull: false
    },
    issuedDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    expirationDate: {
      type: DataTypes.DATE,
      allowNull: false,
    }
  }, {
    sequelize,
    modelName: 'EconomicLicense',
  });

  return EconomicLicense;
};