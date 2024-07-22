const { DataTypes } = require("sequelize");
const sequelize = require("./sequelize"); // Adjust the path to your sequelize instance

const EconomicActivity = sequelize.define('EconomicActivity', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    code: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    alicuota: {
        type: DataTypes.DECIMAL(5, 2), // Tax percentage
        allowNull: false,
    },
    minimumTax: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
}, {
    underscored: true,
    timestamps: false,
    createdAt: false,
    updatedAt: false,
});

// EconomicActivity.hasMany(EconomicLicense, {
//     foreignKey: "economicActivityId"
// });

// EconomicActivity.sync()

module.exports = EconomicActivity;