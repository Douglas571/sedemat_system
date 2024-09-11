'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('GrossIncomes', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      businessId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Businesses', // Reference the Businesses table
          key: 'id'
        },
      },
      branchOfficeId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'BranchOffices', // Reference the BranchOffices table
          key: 'id'
        }
      },
      period: {
        type: Sequelize.DATE,
        allowNull: false
      },
      amountBs: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: false
      },
      chargeWasteCollection: {
        type: Sequelize.BOOLEAN,
        allowNull: false
      },
      declarationImage: {
        type: Sequelize.STRING,
        allowNull: false
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
    await queryInterface.dropTable('GrossIncomes');
  }
};