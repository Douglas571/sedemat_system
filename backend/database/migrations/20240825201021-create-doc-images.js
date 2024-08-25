'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('DocImages', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      pageNumber: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      url: {
        type: Sequelize.STRING,
        allowNull: false
      },
      zonationId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Zonations', // Name of the referenced table
          key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      leaseDocId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'LeaseDocs', // Name of the referenced table
          key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      buildingDocId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'BuildingDocs', // Name of the referenced table
          key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },

      permitDocId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'PermitDocs',
          key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },

      certificateOfIncorporationId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'CertificatesOfIncorporation',
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
    await queryInterface.dropTable('DocImages');
  }
};