'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.addColumn("Businesses", "ownerPersonId", {
        type: Sequelize.INTEGER,
        //allowNull: false, // just for now...
        references: {
          model: 'People',
          key: 'id'
        }
      }, { transaction });
    
      await queryInterface.addColumn("Businesses", "accountantPersonId", {
        type: Sequelize.INTEGER,
        //allowNull: false, // just for now...
        references: {
          model: 'People',
          key: 'id'
        }
      }, { transaction });
    
      await queryInterface.addColumn("Businesses", "administratorPersonId", {
        type: Sequelize.INTEGER,
        //allowNull: false, // just for now...
        references: {
          model: 'People',
          key: 'id'
        }
      }, { transaction });
    });
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.removeColumn('Businesses', 'ownerPersonId');
    await queryInterface.removeColumn('Businesses', 'accountantPersonId');
    await queryInterface.removeColumn('Businesses', 'administratorPersonId');
  }
};
