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

      // user can have many economic licenses associated as economicLicenseCreated
      User.hasMany(models.EconomicLicense, {
        foreignKey: 'createdByUserId',
        as: 'economicLicensesCreated'
      });

      // user can have many economic license associated as economicLicenseChecked
      User.hasMany(models.EconomicLicense, {
        foreignKey: 'checkedByUserId',
        as: 'economicLicensesChecked'
      });
      
      // user can have one settlement
      User.hasMany(models.Settlement, {
        foreignKey: 'settledByUserId',
        as: 'settlements'
      });
    }
  }

  User.init({
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },

    password: {
      type: DataTypes.STRING,
      allowNull: false
    },

    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },

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
    paranoid: true,
  });
  return User;
};