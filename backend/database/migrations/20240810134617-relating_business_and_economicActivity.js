'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Businesses', 'economicActivityId', {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'EconomicActivities',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Businesses', 'economicActivityId');
  }
};