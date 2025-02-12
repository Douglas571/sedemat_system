'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    
    const transaction = await queryInterface.sequelize.transaction();

    try {
      
      await queryInterface.addColumn(
        'GrossIncomeInvoice',
        'updatedByUserId',
        {
          type: Sequelize.INTEGER,
          allowNull: true, 
          references: {
            model: 'Users', 
            key: 'id',
          },
          onUpdate: 'CASCADE',
          onDelete: 'SET NULL',
        },
        { transaction }
      );

      await queryInterface.addColumn(
        'GrossIncomeInvoice',
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
        'GrossIncomeInvoice',
        'updatedByUserId',
        { transaction }
      );

      
      await queryInterface.removeColumn(
        'GrossIncomeInvoice',
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