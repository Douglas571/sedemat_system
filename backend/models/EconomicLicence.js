const { DataTypes } = require("sequelize");
const sequelize = require("./sequelize"); // Adjust the path to your sequelize instance

const EconomicLicense = sequelize.define('EconomicLicense', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    branchOfficeId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'BranchOffices', // Adjust this to your actual model name
            key: 'id'
        },
        allowNull: false
    },
    economicActivityId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'EconomicActivity', // Adjust this to your actual model name
            key: 'id'
        }
    },
    openAt: {
        type: DataTypes.TIME,
        allowNull: false
    },
    closeAt: {
        type: DataTypes.TIME,
        allowNull: false
    },
    issuedDate: {
        type: DataTypes.DATE,
        allowNull: false
    },
    expirationDate: {
        type: DataTypes.DATE,
        allowNull: false
    },
}, {
    underscored: true,
    timestamps: false,
    createdAt: false,
    updatedAt: false,
});

module.exports = EconomicLicense;