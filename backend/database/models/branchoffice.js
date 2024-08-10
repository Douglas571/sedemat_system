'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class BranchOffice extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({EconomicLicense}) {
      // define association here
      BranchOffice.hasMany(EconomicLicense, {
        foreignKey: "branchOfficeId"
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
    origin: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'BranchOffice',
  });
  return BranchOffice;
};