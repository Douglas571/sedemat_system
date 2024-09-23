'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Users', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },

      username: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      
      password: {
        type: Sequelize.STRING,
        allowNull: false
      },

      roleId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Roles',
          key: 'id'
        }
      },
      personId: {
        type: Sequelize.INTEGER,
        // allowNull: false,
        unique: true,
        references: {
          model: 'People',
          key: 'id'
        }
      },

      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      },

      deletedAt: {
        type: Sequelize.DATE,
        allowNull: true // This will be populated when the record is soft deleted
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Users');
  }
};