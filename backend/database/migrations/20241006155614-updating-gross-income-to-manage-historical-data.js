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
    await queryInterface.addColumn('GrossIncomes', 'alicuotaMinTaxMMVBCV', {
      type: Sequelize.DECIMAL(10, 4),
      allowNull: false
    })
    await queryInterface.addColumn('GrossIncomes', 'alicuotaTaxPercent', {
      type: Sequelize.DECIMAL(10, 4),
      allowNull: false
    })
    await queryInterface.addColumn('GrossIncomes', 'branchOfficeDimensionsMts2', {
      type: Sequelize.DECIMAL(10, 4),
      defaultValue: 0,
      allowNull: true
    })
    await queryInterface.addColumn('GrossIncomes', 'branchOfficeType', {
      type: Sequelize.STRING(5),
      defaultValue: '',
      allowNull: true
    })
    await queryInterface.addColumn('GrossIncomes', 'wasteCollectionTaxMMVBCV', {
      type: Sequelize.DECIMAL(10, 4),
      allowNull: true
    })
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */

    await queryInterface.removeColumn('GrossIncomes', 'alicuotaMinTaxMMVBCV');
    await queryInterface.removeColumn('GrossIncomes', 'alicuotaTaxPercent');
    await queryInterface.removeColumn('GrossIncomes', 'branchOfficeDimensionsMts2');
    await queryInterface.removeColumn('GrossIncomes', 'branchOfficeType');
    await queryInterface.removeColumn('GrossIncomes', 'wasteCollectionTaxMMVBCV');
  }
};
