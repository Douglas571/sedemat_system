const { DataTypes } = require("sequelize")
const sequelize = require("./sequelize")

const EconomicActivity = require("./economicActivity");
const Person = require("./person")

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
            model: 'EconomicActivity',
            key: 'id'
        }
    },
    
    ownerPersonId: {
        type: DataTypes.INTEGER,
        //allowNull: false, // just for now...
        references: {
            model: 'Person', 
            key: 'id'
        }
    },

    preferredChannel: DataTypes.STRING,
    sendCalculosTo: DataTypes.STRING,
    preferredContact: DataTypes.STRING,

    reminder_interval: DataTypes.INTEGER

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

Business.belongsTo(Person, {
    foreignKey: "ownerPersonId",
    as: 'owner'
})

Person.hasMany(Business, {
    foreignKey: "ownerPersonId"
})

async function sync() {
    await Business.sync()
}

// sync()

module.exports = Business