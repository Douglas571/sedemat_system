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

    await queryInterface.changeColumn('BranchOffices', 'dimensions', {
      type: Sequelize.DECIMAL(10, 4),
      allowNull: false,
      defaultValue: 50
    });
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.changeColumn('BranchOffices', 'dimensions', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
  }
};
