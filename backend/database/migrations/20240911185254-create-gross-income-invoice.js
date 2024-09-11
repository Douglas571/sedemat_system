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
      
      isPaid: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      formPriceBs: {
        type: Sequelize.FLOAT,
        allowNull: false
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