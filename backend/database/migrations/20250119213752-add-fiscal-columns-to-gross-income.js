'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('GrossIncomes', 'fiscalMarkAsPaid', {
      type: Sequelize.BOOLEAN,
      allowNull: true, // Optional column
      defaultValue: false,
    });

    await queryInterface.addColumn('GrossIncomes', 'fiscalNote', {
      type: Sequelize.STRING,
      allowNull: true, // Optional column
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('GrossIncomes', 'fiscalMarkAsPaid');
    await queryInterface.removeColumn('GrossIncomes', 'fiscalNote');
  },
};
