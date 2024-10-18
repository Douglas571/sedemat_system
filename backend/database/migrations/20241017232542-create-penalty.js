'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Penalties', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      penaltyTypeId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'PenaltyTypes',
          key: 'id'
        },
      },
      grossIncomeInvoiceId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'GrossIncomeInvoices', // Ensure GrossIncomeInvoice model exists
          key: 'id'
        },
      },
      amountMMVBCV: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      description: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      createdByUserId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id'
        },
      },
      revokedByUserId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Users',
          key: 'id'
        },
      },
      revocationReason: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      revokedAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Penalties');
  }
};
