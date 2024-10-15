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
    await queryInterface.addColumn('GrossIncomeInvoices', 'TCMMVBCVValidSince', {
      type: Sequelize.DATE,
      allowNull: true,
    });

    await queryInterface.addColumn('GrossIncomeInvoices', 'TCMMVBCVValidUntil', {
      type: Sequelize.DATE,
      allowNull: true,
    });
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */

    await queryInterface.removeColumn('GrossIncomeInvoices', 'TCMMVBCVValidSince');
    await queryInterface.removeColumn('GrossIncomeInvoices', 'TCMMVBCVValidUntil');
  }
};
