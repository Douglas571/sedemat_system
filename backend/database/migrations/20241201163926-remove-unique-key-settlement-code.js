'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Remove the unique key constraint from `settlements` table
    await queryInterface.removeConstraint('settlements', 'settlement_unique_code');
  },

  down: async (queryInterface, Sequelize) => {
    // Re-add the unique key constraint to `settlements` table
    await queryInterface.addConstraint('settlements', {
      fields: ['code'],
      type: 'unique',
      name: 'settlement_unique_code', // Same name as before
    });
  }
};
