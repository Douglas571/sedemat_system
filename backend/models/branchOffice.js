const { DataTypes } = require("sequelize");
const sequelize = require("./sequelize");
const EconomicLicense = require("./economicLicense")
const BranchOffice = sequelize.define('BranchOffice', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    address: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    phone: {
        type: DataTypes.STRING
    },
    businessId: {
        type: DataTypes.INTEGER,
        references: {
            model: 'Businesses', // Name of the related table
            key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
    },
}, {
    underscored: true,
    timestamps: false,
    createdAt: false,
    updatedAt: false,
});

BranchOffice.hasMany(EconomicLicense, {
    foreignKey: "branchOfficeId"
})

async function sync() {
    await BranchOffice.sync({ force: true });
}

module.exports = BranchOffice;
