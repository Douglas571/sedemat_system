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

    await queryInterface.bulkInsert('GrossIncomes', [
      {
        businessId: 1,
        branchOfficeId: 1,
        period: new Date('2024-08-01'),
        amountBs: 5000.00,
        chargeWasteCollection: true,
        declarationImage: 'https://www.shutterstock.com/image-vector/image-illustration-document-order-invoice-600nw-1918048565.jpg',
        grossIncomeInvoiceId: null,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        businessId: 1,
        branchOfficeId: 1,
        period: new Date('2024-07-01'),
        amountBs: 6000.00,
        chargeWasteCollection: false,
        declarationImage: 'https://www.shutterstock.com/image-vector/image-illustration-document-order-invoice-600nw-1918048565.jpg',
        grossIncomeInvoiceId: null,
        createdAt: new Date(),
        updatedAt: new Date()
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
    await queryInterface.bulkDelete('GrossIncomes', null, {});
  }
};
