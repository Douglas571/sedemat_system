const { DataTypes } = require("sequelize")
const sequelize = require("./sequelize")

const Business = sequelize.define('Business', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    business_name: {
        type: DataTypes.STRING,
        unique: true
    },
    dni: DataTypes.STRING,
    

}, {
    timestamps: false,
    createdAt: false,
    updatedAt: false,
})

async function sync() {
    await Business.sync({ force: true })
}

sync()

module.exports = Business