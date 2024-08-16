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
      DocImage.belongsTo(models.Zonation, {
        foreignKey: "zonationId",
        as: "zonation"
      })
    }
  }
  DocImage.init({
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    url: DataTypes.STRING,
    path: DataTypes.STRING,
    pageNumber: DataTypes.INTEGER,

    zonationId: {
      type: DataTypes.INTEGER,
      reference: {
        model: 'Zonations',
        key: 'id',
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