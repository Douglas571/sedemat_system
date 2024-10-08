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
    await queryInterface.addColumn('GrossIncomeInvoices', 'businessName', {
      type: Sequelize.STRING,
      allowNull: false,
    });
    await queryInterface.addColumn('GrossIncomeInvoices', 'businessDNI', {
      type: Sequelize.STRING,
      allowNull: false,
    });
    await queryInterface.addColumn('GrossIncomeInvoices', 'branchOfficeName', {
      type: Sequelize.STRING,
      allowNull: false,
    });
    await queryInterface.addColumn('GrossIncomeInvoices', 'branchOfficeAddress', {
      type: Sequelize.STRING,
      allowNull: false,
    });
    await queryInterface.addColumn('GrossIncomeInvoices', 'branchOfficeDimensions', {
      type: Sequelize.DOUBLE,
      allowNull: false,
    });
    await queryInterface.addColumn('GrossIncomeInvoices', 'branchOfficeType', {
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
    await queryInterface.removeColumn('GrossIncomeInvoices', 'businessName');
    await queryInterface.removeColumn('GrossIncomeInvoices', 'businessDNI');
    
    await queryInterface.removeColumn('GrossIncomeInvoices', 'branchOfficeName');
    await queryInterface.removeColumn('GrossIncomeInvoices', 'branchOfficeAddress');
    await queryInterface.removeColumn('GrossIncomeInvoices', 'branchOfficeDimensions');
    await queryInterface.removeColumn('GrossIncomeInvoices', 'branchOfficeType');
  }
};
