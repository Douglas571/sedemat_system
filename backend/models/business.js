const { DataTypes } = require("sequelize")
const sequelize = require("./sequelize")

const EconomicActivity = require("./economicActivity");

const Business = sequelize.define('Business', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    businessName: {
        type: DataTypes.STRING,
        unique: true
    },
    dni: DataTypes.STRING, 
    email: DataTypes.STRING,
    companyIncorporationDate: DataTypes.DATE,
    companyExpirationDate: DataTypes.DATE,
    directorsBoardExpirationDate: DataTypes.DATE,
    
    economicActivityId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'EconomicActivity', // Adjust this to your actual model name
            key: 'id'
        }
    },
}, {
    underscored: true,
    timestamps: false,
    createdAt: false,
    updatedAt: false,
})

Business.belongsTo(EconomicActivity, {
    foreignKey: "economicActivityId",
    as: 'economicActivity'
})

EconomicActivity.hasMany(Business, {
    foreignKey: "economicActivityId"
})

async function sync() {
    await Business.sync({ force: true })
}

module.exports = Business