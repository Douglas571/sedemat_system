const { Sequelize, DataTypes } = require("sequelize")

const sequelize = new Sequelize('sedemat', 'sedemat_server', '12345', {
    host: 'mariadb', // replace with your host
    dialect: 'mariadb',
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    },
    logging: false // Set to true if you want to see the SQL queries
});

// Test the database connection



console.log("testing the db")

// CREATE TABLE Payments (
//     id INT AUTO_INCREMENT PRIMARY KEY,
//     amount DECIMAL(10, 2) NOT NULL,
//     reference VARCHAR(255) NOT NULL,
//     dni VARCHAR(15) NOT NULL,
//     account VARCHAR(30) NOT NULL,
//     paymentDate DATE NOT NULL
// );

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
    // don't add the timestamp attributes (updatedAt, createdAt)
    // add liquidation date
    // add state 
}, {
    timestamps: false,
    createdAt: false,
    updatedAt: false,
})

async function testConnection() {
    try {
        await sequelize.authenticate();
        await sequelize.sync();
        console.log('Connection to the database has been established successfully.');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
}

testConnection();



module.exports = Payment