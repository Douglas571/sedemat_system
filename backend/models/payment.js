const { Sequelize, DataTypes } = require("sequelize")

const sequelize = new Sequelize('sedemat', 'sedemat_server', '12345', {
    host: 'mariadb', // replace with your host
    dialect: 'mariadb',
    pool: {
        max: 5,
        min: 0,
        acquire: 100*1000,
        idle: 10000
    },
    retry: {
        match: [
            /ETIMEDOUT/,
            /EHOSTUNREACH/,
            /ECONNREFUSED/,
            /ECONNRESET/,
            /ENOTFOUND/,
            /EAI_AGAIN/
        ],
        max: 5 // Number of retry attempts
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
    image: DataTypes.STRING ,
    state: DataTypes.STRING,
    business_name: DataTypes.STRING,
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
        console.log("waithing for database...")
        await new Promise(resolve => setTimeout(resolve, 15000));
        console.log("testing the connection")
        await sequelize.authenticate();
        await sequelize.sync();
        console.log('Connection to the database has been established successfully.');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
}

// this is just to test the connection, the client will wait until the server is ready anyways
// testConnection();



module.exports = Payment