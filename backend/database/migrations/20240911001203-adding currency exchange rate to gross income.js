'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.addColumn('GrossIncomes', 'CurrencyExchangeRatesId', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'CurrencyExchangeRates',
        key: 'id'
      }
    });
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.removeColumn('GrossIncomes', 'CurrencyExchangeRatesId');
  }
};
