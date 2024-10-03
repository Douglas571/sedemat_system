module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Settlements', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      code: {
        type: Sequelize.STRING,
        allowNull: false
      },
      
      settledByUserId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users', 
          key: 'id'
        },
        // onUpdate: 'CASCADE',
        // onDelete: 'SET NULL'
      },
      grossIncomeInvoiceId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'GrossIncomeInvoices', // Assuming your GrossIncomeInvoice model's table name
          key: 'id'
        },
        unique: true,
        // onUpdate: 'CASCADE',
        // onDelete: 'SET NULL'
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      }
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('Settlements');
  }
};