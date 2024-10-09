'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('CurrencyExchangeRates', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },

      
      dolarBCVToBs: {
        type: Sequelize.DECIMAL(6, 2),
        allowNull: false,
      },
      eurosBCVToBs: {
        type: Sequelize.DECIMAL(6, 2),
        allowNull: false,
      },
      dolarBlackToBs: {
        type: Sequelize.DECIMAL(6, 2),
        // allowNull: false,
      },
      euroBlackToBs: {
        type: Sequelize.DECIMAL(6, 2),
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
    await queryInterface.dropTable('CurrencyExchangeRates');
  }
};