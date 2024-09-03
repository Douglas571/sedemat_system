'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('InvoiceItems', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      
      
      invoiceItemTypeId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
            model: 'InvoiceItemTypes',
            key: 'id'
        }
      },
      invoiceId: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
              model: 'Invoices',
              key: 'id'
          }
      },
      amountMMV: {
          type: Sequelize.FLOAT,
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
    await queryInterface.dropTable('InvoiceItems');
  }
};