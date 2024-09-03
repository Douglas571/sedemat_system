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
    
    await queryInterface.addColumn('EconomicLicenses', 'createdByPersonId', {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'People',
        key: 'id'
      }
    });

    await queryInterface.addColumn('EconomicLicenses', 'checkedByPersonId', {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'People',
        key: 'id'
      }
    });

    await queryInterface.addColumn('EconomicLicenses', 'invoiceId', {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'Invoices',
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
    await queryInterface.removeColumn('EconomicLicenses', 'createdByPersonId');
    await queryInterface.removeColumn('EconomicLicenses', 'checkedByPersonId');
    await queryInterface.removeColumn('EconomicLicenses', 'invoiceId');
  }
};
