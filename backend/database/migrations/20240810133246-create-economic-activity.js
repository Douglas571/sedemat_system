'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('EconomicActivities', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      code: {
        type: Sequelize.INTEGER,
        allowNull: false,
        unique: true
      },
      title: {
          type: Sequelize.STRING,
          allowNull: false,
          unique: true
      },
      alicuota: {
          type: Sequelize.DECIMAL(5, 2), // Tax percentage
          allowNull: false,
      },
      minimumTax: {
          type: Sequelize.DECIMAL(10, 2),
          allowNull: false,
      },
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
    await queryInterface.dropTable('EconomicActivities');
  }
};