'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('BranchOffices', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      

      // fields goes here
      address: {
          type: Sequelize.STRING,
          allowNull: false,
      },
      phone: {
          type: Sequelize.STRING
      },
      businessId: {
          type: Sequelize.INTEGER,
          references: {
              model: 'Businesses', // Name of the related table
              key: 'id'
          },
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE',
      },
      zone: Sequelize.STRING,
      dimensions: Sequelize.INTEGER,
      type: Sequelize.STRING, // it can be I, II, III
      origin: Sequelize.STRING,

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
    await queryInterface.dropTable('BranchOffices');
  }
};