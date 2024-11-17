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

    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.addColumn(
        'Businesses',
        'businessActivityCategoryId',
        {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: {
            model: 'BusinessActivityCategories',
            key: 'id',
          }
        },
        { transaction }
      );

      await queryInterface.addColumn(
        'Businesses',
        'settlementArchiveIndex',
        {
          type: Sequelize.INTEGER,
          allowNull: true,
        },
        { transaction }
      );

      await queryInterface.addColumn(
        'Businesses',
        'pendingArchiveIndex',
        {
          type: Sequelize.INTEGER,
          allowNull: true,
        },
        { transaction }
      );
    });
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.removeColumn('Businesses', 'businessActivityCategoryId', { transaction });
      await queryInterface.removeColumn('Businesses', 'settlementArchiveIndex', { transaction });
      await queryInterface.removeColumn('Businesses', 'pendingArchiveIndex', { transaction });
    });

  }
};
