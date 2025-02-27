'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('EconomicLicenses', {

      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },

      isSuspended: {
        type: Sequelize.BOOLEAN,
        allowNull: true
      },

      openAt: {
        type: Sequelize.TIME,
        // allowNull: false,
      },

      closeAt: {
        type: Sequelize.TIME,
        // allowNull: false
      },

      issuedDate: {
        type: Sequelize.DATE,
        // allowNull: false,
      },

      expirationDate: {
        type: Sequelize.DATE,
        // allowNull: false,
      },

      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },

      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }

    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('EconomicLicenses');
  }
};