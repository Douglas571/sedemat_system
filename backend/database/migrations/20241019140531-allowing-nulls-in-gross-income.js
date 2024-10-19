module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('GrossIncomes', 'amountBs', {
      type: Sequelize.DECIMAL(15, 2),
      allowNull: true,
    });

    await queryInterface.changeColumn('GrossIncomes', 'declarationImage', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('GrossIncomes', 'amountBs', {
      type: Sequelize.DECIMAL(15, 2),
      allowNull: false,
    });

    await queryInterface.changeColumn('GrossIncomes', 'declarationImage', {
      type: Sequelize.STRING,
      allowNull: false,
    });
  },
};