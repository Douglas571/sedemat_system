'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('PermitDocs', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      expirationDate: {
        type: Sequelize.DATE
      },

      type: {
        allowNull: false,
        type: Sequelize.ENUM('FIRE', 'HEALTH')
      },

      branchOfficeId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'BranchOffices',
          key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
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
    await queryInterface.dropTable('PermitDocs');
  }
};