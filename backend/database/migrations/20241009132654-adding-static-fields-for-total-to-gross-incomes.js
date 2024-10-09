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

    await queryInterface.addColumn('GrossIncomes', 'taxInBs', {
      type: Sequelize.DECIMAL(10, 2),
      defaultValue: 0
    });
    await queryInterface.addColumn('GrossIncomes', 'minTaxInBs', {
      type: Sequelize.DECIMAL(10, 2),
      defaultValue: 0
    });
    await queryInterface.addColumn('GrossIncomes', 'wasteCollectionTaxInBs', {
      type: Sequelize.DECIMAL(10, 2),
      defaultValue: 0
    });
    await queryInterface.addColumn('GrossIncomes', 'totalTaxInBs', {
      type: Sequelize.DECIMAL(10, 2),
      defaultValue: 0
    });
    
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */

    await queryInterface.removeColumn('GrossIncomes', 'taxInBs');
    await queryInterface.removeColumn('GrossIncomes', 'minTaxInBs');
    await queryInterface.removeColumn('GrossIncomes', 'wasteCollectionTaxInBs');
    await queryInterface.removeColumn('GrossIncomes', 'totalTaxInBs');
  }
};
