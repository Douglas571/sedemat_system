const { DataTypes, Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Vehicle extends Model {
    static associate(models) {
      const { Person, Business, VehicleType } = models;

      // Associate Vehicle with Person
      Vehicle.belongsTo(Person, {
        foreignKey: 'ownerId',
        as: 'owner'
      });
      
      // Associate Vehicle with Business
      Vehicle.belongsTo(Business, {
        foreignKey: 'businessOwnerId',
        as: 'businessOwner'
      });

      // Associate Vehicle with VehicleType
      Vehicle.belongsTo(VehicleType, {
        foreignKey: 'vehicleTypeId',
        as: 'vehicleType'
      });
    }

  }

  Vehicle.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      plate: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      isPublicTransport: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      brand: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      model: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      year: {
        type: DataTypes.STRING, // Store only the date (YYYY-MM-DD)
        allowNull: false,
      },
      usage: {
        type: DataTypes.STRING,
        allowNull: false,
        // This is interesting, but i will disable it for now
        // validate: {
        //   isIn: [['personal', 'commercial', 'public']], // Example usage types
        // },
      },
      color: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      vehicleTypeId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'vehicleTypes', // Points to the vehicle_types table
          key: 'id',
        },
      },
      ownerId: {
        type: DataTypes.INTEGER,
        allowNull: true, // Optional (either ownerId or businessOwnerId must be present)
        references: {
          model: 'people', // Points to the people table
          key: 'id',
        },
      },
      businessOwnerId: {
        type: DataTypes.INTEGER,
        allowNull: true, // Optional (either ownerId or businessOwnerId must be present)
        references: {
          model: 'businesses', // Points to the businesses table
          key: 'id',
        },
      },
    },
    {
      sequelize,
      modelName: 'Vehicle',
      timestamps: true,
    }
  );

  return Vehicle
}