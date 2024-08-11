'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
    */
    await queryInterface.bulkInsert('EconomicActivities', [
      { code: 1001, title: 'Comercio al por menor', alicuota: 1.50, minimumTax: 5.00, createdAt: new Date(), updatedAt: new Date() },
      { code: 1002, title: 'Comercio al por mayor', alicuota: 2.00, minimumTax: 6.00, createdAt: new Date(), updatedAt: new Date() },
      { code: 1003, title: 'Servicios financieros', alicuota: 2.50, minimumTax: 7.00, createdAt: new Date(), updatedAt: new Date() },
      { code: 1004, title: 'Transporte y almacenamiento', alicuota: 1.75, minimumTax: 5.50, createdAt: new Date(), updatedAt: new Date() },
      { code: 1005, title: 'Construcción', alicuota: 2.25, minimumTax: 6.50, createdAt: new Date(), updatedAt: new Date() },
      { code: 1006, title: 'Servicios profesionales', alicuota: 3.00, minimumTax: 8.00, createdAt: new Date(), updatedAt: new Date() },
      { code: 1007, title: 'Educación', alicuota: 1.00, minimumTax: 5.00, createdAt: new Date(), updatedAt: new Date() },
      { code: 1008, title: 'Salud', alicuota: 2.75, minimumTax: 9.00, createdAt: new Date(), updatedAt: new Date() },
      { code: 1009, title: 'Agricultura', alicuota: 1.25, minimumTax: 5.75, createdAt: new Date(), updatedAt: new Date() },
      { code: 1010, title: 'Tecnología de la información', alicuota: 2.50, minimumTax: 10.00, createdAt: new Date(), updatedAt: new Date() },
    ], {});
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    await queryInterface.bulkDelete('EconomicActivities', null, {});
  }
};
