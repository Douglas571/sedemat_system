'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Roles', [
      { id: 1, name: 'Administrador', createdAt: new Date(), updatedAt: new Date() },
      { id: 2, name: 'Director', createdAt: new Date(), updatedAt: new Date() },
      { id: 3, name: 'Asesor Jurídico', createdAt: new Date(), updatedAt: new Date() },
      { id: 4, name: 'Recaudador', createdAt: new Date(), updatedAt: new Date() },
      { id: 5, name: 'Coordinador', createdAt: new Date(), updatedAt: new Date() },
      { id: 6, name: 'Fiscal', createdAt: new Date(), updatedAt: new Date() },
      { id: 7, name: 'Contribuyente', createdAt: new Date(), updatedAt: new Date() },
      { id: 8, name: 'Liquidador', createdAt: new Date(), updatedAt: new Date() }
    ], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Roles', null, {});
  }
};