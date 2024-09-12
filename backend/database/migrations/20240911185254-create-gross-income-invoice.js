'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('GrossIncomeInvoices', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },

      formPriceBs: {
        type: Sequelize.FLOAT,
        allowNull: false,
        defaultValue: 0
      },

      paidAt: {
        type: Sequelize.DATE,
        allowNull: true 
      },

      totalBs: {
        type: Sequelize.FLOAT,
        allowNull: false,
        defaultValue: 0
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
    await queryInterface.dropTable('GrossIncomeInvoices');
  }
};