const { DataTypes } = require("sequelize")
const sequelize = require("./sequelize")

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
    establishmentDate: DataTypes.DATE,
    expirationDate: DataTypes.DATE,
    boardExpirationDate: DataTypes.DATE
    
}, {
    underscored: true,
    timestamps: false,
    createdAt: false,
    updatedAt: false,
})

async function sync() {
    await Business.sync({ force: true })
}

module.exports = Business