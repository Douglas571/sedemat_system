module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('GrossIncomeInvoices', 'note', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn('GrossIncomeInvoices', 'note');
  },
};
