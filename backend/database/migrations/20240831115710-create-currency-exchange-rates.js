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
        type: Sequelize.DECIMAL,
        allowNull: false,
      },
      eurosBCVToBs: {
        type: Sequelize.DECIMAL,
        allowNull: false,
      },
      dolarBlackToBs: {
        type: Sequelize.DECIMAL,
        // allowNull: false,
      },
      euroBlackToBs: {
        type: Sequelize.DECIMAL,
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