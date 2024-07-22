const { Sequelize } = require("sequelize")

console.log({DB: {
    ENV: process.env.ENV,
    DB_DATA_BASE_NAME: process.env.DB_DATA_BASE_NAME
}})

console.log({env: process.env})

console.log("Connecting to Database")
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

module.exports = sequelize