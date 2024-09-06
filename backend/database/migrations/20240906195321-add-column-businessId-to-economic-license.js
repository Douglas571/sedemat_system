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
    // add column businessId to economic license table
    await queryInterface.addColumn('EconomicLicenses', 'businessId', {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'Businesses',
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
    await queryInterface.removeColumn('EconomicLicenses', 'businessId');
  }
};
