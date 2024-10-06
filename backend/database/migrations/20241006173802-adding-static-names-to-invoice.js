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
    await queryInterface.addColumn('GrossIncomeInvoices', 'createdByUserPersonFullName', {
      type: Sequelize.STRING,
      allowNull: false,
    });
    await queryInterface.addColumn('GrossIncomeInvoices', 'checkedByUserPersonFullName', {
      type: Sequelize.STRING,
      allowNull: false,
    });
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */

    await queryInterface.removeColumn('GrossIncomeInvoices', 'createdByUserPersonFullName');
    await queryInterface.removeColumn('GrossIncomeInvoices', 'checkedByUserPersonFullName');
  }
};
