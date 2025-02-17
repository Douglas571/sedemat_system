'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('UserReportFiscals', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      timestamp: {
        type: Sequelize.DATE
      },
      username: {
        type: Sequelize.STRING
      },
      userId: {
        type: Sequelize.INTEGER,  
        references: {
          model: 'Users',
          key: 'id',
        },
      },
      grossIncomesCreated: {
        type: Sequelize.INTEGER
      },
      paymentsCreated: {
        type: Sequelize.INTEGER
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
    await queryInterface.dropTable('UserReportFiscals');
  }
};