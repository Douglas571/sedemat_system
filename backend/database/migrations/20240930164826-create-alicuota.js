'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Alicuotas', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      economicActivityId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'EconomicActivities', // Make sure this model is already created in your database
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      taxPercent: {
        type: Sequelize.DECIMAL(5, 4), // Adjust the precision as needed
        allowNull: false,
      },
      minTaxMMV: {
        type: Sequelize.DECIMAL(10, 4), // Adjust the precision as needed
        allowNull: false,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW'),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW'),
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Alicuotas');
  },
};
