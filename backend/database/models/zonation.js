'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Zonation extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here

      const {DocImage} = models
      Zonation.hasMany(DocImage, {
        foreignKey: "zonationId",
        as: 'docImages'
      })
    }
  }
  Zonation.init({
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    
    branchOfficeId: {
      type: DataTypes.INTEGER, 
      reference: {
        model: 'BranchOffices',
        key: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    },

  }, {
    sequelize,
    modelName: 'Zonation',
  });
  return Zonation;
};