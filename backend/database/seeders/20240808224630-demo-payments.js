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
    await queryInterface.bulkInsert('Payments', [
      {
        businessName: 'CASA CHEN, C.A',
        amount: 100.50,
        reference: '122345',
        dni: 'E-8228509-0',
        account: '0102-0123-4500-0001',
        paymentDate: '2024-01-01',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        businessName: 'COMERCIAL SOL CARIBE',
        amount: 200.75,
        reference: '677890',
        dni: 'E-82288744-1',
        account: '0102-0123-4500-0002',
        paymentDate: '2024-02-01',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        businessName: 'CARNICERIA TAICO',
        amount: 50.00,
        reference: '115121',
        dni: 'E-84417324-8',
        account: '0102-0123-4500-0003',
        paymentDate: '2024-03-01',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        businessName: 'ALCALDÍA DE ZAMORA',
        amount: 300.20,
        reference: '141251',
        dni: 'G-200006366',
        account: '0102-0123-4500-0004',
        paymentDate: '2024-04-01',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        businessName: 'BANCO BICENTENARIO DEL PUEBLO DE LA CLASE OBRERA, MUJER Y COMUNAS, BANCO UNIVERSAL, C.A',
        amount: 120.99,
        reference: '161371',
        dni: 'G-20009148-7',
        account: '0102-0123-4500-0005',
        paymentDate: '2024-05-01',
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ], {});
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    await queryInterface.bulkDelete('Payments', null, {});
  }
};
