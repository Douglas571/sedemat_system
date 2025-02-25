'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('vehicleTypes', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      type: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      taxMMVBCV: {
        type: Sequelize.DECIMAL(10, 4),
        allowNull: false,
      },
      // isValid: {
      //   type: Sequelize.BOOLEAN,
      //   defaultValue: false,
      //   allowNull: false,
      // },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('vehicleTypes');
  },
};