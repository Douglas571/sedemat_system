'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addConstraint('Settlements', {
      fields: ['code'],
      type: 'UNIQUE',
      name: 'settlement_unique_code'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeConstraint('Settlements', 'settlement_unique_code');
  },
};