'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('PenaltyTypes', [
      {
        id: 1,
        name: 'Baja',
        defaultAmountMMVBCV: 20,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 2,
        name: 'Media',
        defaultAmountMMVBCV: 40,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 3,
        name: 'Alta',
        defaultAmountMMVBCV: 60,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('PenaltyTypes', null, {});
  }
};