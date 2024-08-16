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

    await queryInterface.addColumn('DocImages', 'zonationId', {
      type: Sequelize.INTEGER,
      allowNull: true,
      reference: {
        model: 'Zonations',
        key: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    })
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */

    await queryInterface.removeColumn('DocImages', 'zonationId');
  }
};
