const path = require('path')

'use strict';
const {
  Model
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class File extends Model {
    static associate(models) {

      // a file can have one user
      File.belongsTo(models.User, {
        foreignKey: 'createdByUserId',
        as: 'createdByUser'
      });

      File.belongsToMany(models.GrossIncome, {
        through: models.SupportFilesToGrossIncomes,
        foreignKey: 'fileId',
        as: 'grossIncome'
      })
    }
  }
  File.init({
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    path: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    type: {
      type: DataTypes.ENUM('image', 'pdf', 'excel', 'csv'),
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    folder: {
      type: DataTypes.STRING, // TODO: DataTypes.ENUM('gross incomes', 'payments'), // Restricts values to valid folders
      allowNull: false,
    },
    createdByUserId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },

    url: {
      type: DataTypes.VIRTUAL,
      get() {
        let { IP, PORT } = process.env

        console.log({file: this})
        let uploadPath = this.path.split('backend')[1]
        uploadPath = uploadPath.split(path.sep).join('/')

        console.log({base: `http://${IP}:${PORT}`, uploadPath})
  
        let url = new URL(`http://${IP}:${PORT}`)

        url.pathname = uploadPath
  
        return url.toString()
      }
    }
    
  }, {
    sequelize,
    modelName: 'File',
  });
  return File;
};