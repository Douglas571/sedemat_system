'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('UserReportTaxCollectors', {
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
      grossIncomeInvoicesCreated: {
        type: Sequelize.INTEGER
      },
      grossIncomeInvoicesIssued: {
        type: Sequelize.INTEGER
      },
      grossIncomeInvoicesUpdated: {
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
    await queryInterface.dropTable('UserReportTaxCollectors');
  }
};