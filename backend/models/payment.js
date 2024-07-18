const { DataTypes } = require("sequelize")
const sequelize = require("./sequelize")

const Payment = sequelize.define('Payment', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    dni: DataTypes.STRING,
    amount: DataTypes.STRING,
    account: DataTypes.STRING,
    reference: {
        type: DataTypes.STRING,
        unique: true
    },
    paymentDate: DataTypes.DATE,
    image: DataTypes.STRING ,
    state: DataTypes.STRING,
    business_name: DataTypes.STRING,
    isVerified: DataTypes.BOOLEAN,
    // don't add the timestamp attributes (updatedAt, createdAt)
    // add liquidation date
    // add state 
}, {
    timestamps: false,
    createdAt: false,
    updatedAt: false,
})

async function sync() {
    await Payment.sync({ force: true })
}


module.exports = Payment