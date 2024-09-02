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


    await queryInterface.addColumn('Payments', 'businessId', {
      type: Sequelize.INTEGER,
      references: {
          model: 'Businesses', // Name of the related table
          key: 'id'
      },
      // onDelete: 'CASCADE',
      // onUpdate: 'CASCADE',
    },
    {
      name: 'paymentBusinessIdFK'
    })

    await queryInterface.addColumn('Payments', 'personId', {
      type: Sequelize.INTEGER,
      //allowNull: false, // just for now...
      references: {
        model: 'People',
        key: 'id'
      },
      // onDelete: 'CASCADE',
      // onUpdate: 'CASCADE',
    },
    {
      name: 'paymentPersonIdFK'
    })
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */

    await queryInterface.removeColumn('Payments', 'businessId', { name: 'paymentBusinessIdFK' })
    await queryInterface.removeColumn('Payments', 'personId', { name: 'paymentPersonIdFK' })
    
  }
};
