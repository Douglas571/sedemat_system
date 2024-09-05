'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      const { Role, Person } = models

      // user belongs to a role 
      User.belongsTo(Role, {
        foreignKey: 'roleId',
        as: 'role'
      });

      // user belongs to person
      User.belongsTo(Person, {
        foreignKey: 'personId',
        as: 'person'
      });
    }
  }
  User.init({
    email: DataTypes.STRING,

    password: DataTypes.STRING,

    roleId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Roles',
        key: 'id'
      }
    },

    personId: {
      type: DataTypes.INTEGER,
      // allowNull: false,
      unique: true,
      references: {
        model: 'People',
        key: 'id'
      }
    }

  }, {
    sequelize,
    modelName: 'User',
  });
  return User;
};