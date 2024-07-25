const { DataTypes } = require("sequelize");
const sequelize = require("./sequelize"); // Adjust the path to your sequelize instance

const Person = sequelize.define('Person', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    dni: {
        type: DataTypes.STRING, // Assuming DNI is a string; if it's a number, use DataTypes.INTEGER
        unique: true,
        allowNull: false,
    },
    firstName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    lastName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    phone: {
        type: DataTypes.STRING,
    },
    whatsapp: {
        type: DataTypes.STRING,
    },
    email: {
        type: DataTypes.STRING,
    }
}, {
    underscored: true,
    timestamps: false,
    createdAt: false,
    updatedAt: false,
});

async function sync() {
    await Person.sync({ force: true });
}

module.exports = Person;