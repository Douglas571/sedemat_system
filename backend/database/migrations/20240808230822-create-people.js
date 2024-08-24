'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('People', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      dni: {
          type: Sequelize.STRING, // Assuming DNI is a string; if it's a number, use Sequelize.INTEGER
          unique: true,
          allowNull: false,
      },
      firstName: {
          type: Sequelize.STRING,
          allowNull: false,
      },
      lastName: {
          type: Sequelize.STRING,
          allowNull: false,
      },
      phone: {
          type: Sequelize.STRING,
      },
      whatsapp: {
          type: Sequelize.STRING,
      },
      email: {
          type: Sequelize.STRING,
      },
  
      profilePictureUrl: Sequelize.STRING,
      
      dniPictureUrl: Sequelize.STRING,
      rifPictureUrl: Sequelize.STRING,
      
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('People');
  }
};