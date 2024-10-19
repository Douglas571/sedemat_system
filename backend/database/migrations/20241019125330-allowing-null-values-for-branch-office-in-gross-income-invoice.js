module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('GrossIncomeInvoices', 'branchOfficeName', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.changeColumn('GrossIncomeInvoices', 'branchOfficeAddress', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.changeColumn('GrossIncomeInvoices', 'branchOfficeDimensions', {
      type: Sequelize.DOUBLE,
      allowNull: true,
    });

    await queryInterface.changeColumn('GrossIncomeInvoices', 'branchOfficeType', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('GrossIncomeInvoices', 'branchOfficeName', {
      type: Sequelize.STRING,
      allowNull: false,
    });

    await queryInterface.changeColumn('GrossIncomeInvoices', 'branchOfficeAddress', {
      type: Sequelize.STRING,
      allowNull: false,
    });

    await queryInterface.changeColumn('GrossIncomeInvoices', 'branchOfficeDimensions', {
      type: Sequelize.DOUBLE,
      allowNull: false,
    });

    await queryInterface.changeColumn('GrossIncomeInvoices', 'branchOfficeType', {
      type: Sequelize.STRING,
      allowNull: false,
    });
  },
};