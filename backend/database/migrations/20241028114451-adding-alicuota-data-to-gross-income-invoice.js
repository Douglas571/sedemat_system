'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('GrossIncomeInvoices', 'economicActivityTitle', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn('GrossIncomeInvoices', 'economicActivityCode', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('GrossIncomeInvoices', 'economicActivityTitle');
    await queryInterface.removeColumn('GrossIncomeInvoices', 'economicActivityCode');
  },
};