'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    
    const transaction = await queryInterface.sequelize.transaction();

    try {
      
      await queryInterface.addColumn(
        'GrossIncomeInvoices',
        'updatedByUserId',
        {
          type: Sequelize.INTEGER,
          allowNull: true, 
          references: {
            model: 'Users', 
            key: 'id',
          },
          onUpdate: 'CASCADE',
        },
        { transaction }
      );

      await queryInterface.addColumn(
        'GrossIncomeInvoices',
        'issuedAt',
        {
          type: Sequelize.DATE,
          allowNull: true, 
        },
        { transaction }
      );

      
      await transaction.commit();
    } catch (error) {
      
      await transaction.rollback();
      throw error; 
    }
  },

  down: async (queryInterface, Sequelize) => {
    
    const transaction = await queryInterface.sequelize.transaction();

    try {
      
      await queryInterface.removeColumn(
        'GrossIncomeInvoices',
        'updatedByUserId',
        { transaction }
      );

      
      await queryInterface.removeColumn(
        'GrossIncomeInvoices',
        'issuedAt',
        { transaction }
      );

      
      await transaction.commit();
    } catch (error) {
      
      await transaction.rollback();
      throw error; 
    }
  },
};