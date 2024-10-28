// backend/database/migrations/20241002123501-adding-is-active-to-branch-offices.js

'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('BranchOffices', 'isActive', {
      type: Sequelize.BOOLEAN,
      defaultValue: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('BranchOffices', 'isActive');
  },
};