'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Change the `code` column type from STRING to INTEGER
    await queryInterface.changeColumn('Settlements', 'code', {
      type: Sequelize.INTEGER,
      allowNull: false,
      unique: true,
    });
  },

  async down(queryInterface, Sequelize) {
    // Revert the `code` column type back to STRING
    await queryInterface.changeColumn('Settlements', 'code', {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
    });
  },
};
