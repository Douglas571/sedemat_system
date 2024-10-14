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
    await queryInterface.bulkInsert('Banks', [
      {
        accountNumber: '0102-0339-2500-0107-1892',
        name: 'Banco de Venezuela',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        accountNumber: '0102-0769-0900-0001-3055',
        name: 'Banco de Venezuela',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        accountNumber: '0175-0162-3100-7494-9290',
        name: 'Banco Bicentenario',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        accountNumber: '0175-0162-1007-2165-5565',
        name: 'Banco Bicentenario',
        createdAt: new Date(),
        updatedAt: new Date()
      },
    ])
  },


  async down (queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */

    await queryInterface.bulkDelete('Banks', null, {})
  }
};
