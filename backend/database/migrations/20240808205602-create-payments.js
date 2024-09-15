'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Payments', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },

      dni: Sequelize.STRING,
      amount: Sequelize.DOUBLE,
      account: Sequelize.STRING,

      reference: {
        type: Sequelize.STRING,
        unique: true
      },

      paymentDate: Sequelize.DATE,
      image: Sequelize.STRING ,
      state: Sequelize.STRING,
      businessName: Sequelize.STRING,
      isVerified: Sequelize.BOOLEAN,

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
    await queryInterface.dropTable('Payments');
  }
};