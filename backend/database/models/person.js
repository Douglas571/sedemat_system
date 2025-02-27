'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Person extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      const { Payment, User } = models

      Person.hasOne(Payment, {
        foreignKey: "personId",
        as: 'payment'
      })

      // a person can have one user
      Person.hasOne(User, {
        foreignKey: 'personId',
        as: 'user'
      });
    }
  }
  Person.init({
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    dni: {
        type: DataTypes.STRING, // Assuming DNI is a string; if it's a number, use DataTypes.INTEGER
        unique: true,
        allowNull: true,
    },

    rif: {
      type: DataTypes.STRING,
      unique: true,
    },

    firstName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    lastName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    phone: {
        type: DataTypes.STRING,
    },
    whatsapp: {
        type: DataTypes.STRING,
    },
    email: {
        type: DataTypes.STRING,
    },

    profilePictureUrl: DataTypes.STRING,

    dniPictureUrl: DataTypes.STRING,
    rifPictureUrl: DataTypes.STRING,
    
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
    modelName: 'Person',
  });
  return Person;
};