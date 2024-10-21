'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('GrossIncomeInvoices', 'firstBankAccountId', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        // the name of the model is Bank, but I'm using tables name here
        model: 'Banks',
        key: 'id'
      }
    });

    await queryInterface.addColumn('GrossIncomeInvoices', 'secondBankAccountId', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'Banks',
        key: 'id'
      }
    });
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn('GrossIncomeInvoices', 'firstBankAccountId');
    await queryInterface.removeColumn('GrossIncomeInvoices', 'secondBankAccountId');
  },
};