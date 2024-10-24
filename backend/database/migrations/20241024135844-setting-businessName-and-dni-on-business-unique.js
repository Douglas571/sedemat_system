'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      // Add unique constraint on 'dni'
      await queryInterface.addConstraint('Businesses', {
        fields: ['dni'],
        type: 'unique',
        name: 'unique_business_dni', // Name of the constraint
        transaction
      });

    });
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      // Remove the unique constraint on 'dni'
      await queryInterface.removeConstraint('Businesses', 'unique_business_dni', { transaction });
    });
  }
};
