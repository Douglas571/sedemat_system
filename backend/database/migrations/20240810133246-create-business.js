'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Businesses', {
      id: {
          type: Sequelize.INTEGER,
          autoIncrement: true,
          primaryKey: true,
      },
      businessName: {
          type: Sequelize.STRING,
          unique: true
      },
      dni: Sequelize.STRING, 
      email: Sequelize.STRING,
      companyIncorporationDate: Sequelize.DATE,
      companyExpirationDate: Sequelize.DATE,
      directorsBoardExpirationDate: Sequelize.DATE,

      ownerPersonId: {
        type: Sequelize.INTEGER,
        //allowNull: false, // just for now...
        references: {
          model: 'People',
          key: 'id'
        }
      },

      accountantPersonId: {
        type: Sequelize.INTEGER,
        //allowNull: false, // just for now...
        references: {
          model: 'People',
          key: 'id'
        }
      },

      administratorPersonId: {
        type: Sequelize.INTEGER,
        //allowNull: false, // just for now...
        references: {
          model: 'People',
          key: 'id'
        }
      },

      economicActivityId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'EconomicActivities',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      preferredChannel: Sequelize.STRING,
      sendCalculosTo: Sequelize.STRING,
      preferredContact: Sequelize.STRING,
  
      reminderInterval: Sequelize.INTEGER,

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
    await queryInterface.dropTable('Businesses');
  }
};