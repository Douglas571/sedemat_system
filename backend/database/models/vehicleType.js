const {
  Model
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class VehicleType extends Model {
    static associate(models) {
      // define associations here
    }
  }
  VehicleType.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    taxMMVBCV: {
      type: DataTypes.DECIMAL(10, 4),
      allowNull: false,
    },
    // disabled while i evaluate if is necesary 
    // isValid: {
    //   type: DataTypes.BOOLEAN,
    //   defaultValue: false, // Default value is false
    //   allowNull: false,
    // },
  }, {
    sequelize,
    modelName: 'VehicleType',
  })

  return VehicleType
}