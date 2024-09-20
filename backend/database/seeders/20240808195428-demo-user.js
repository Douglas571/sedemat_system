'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('Users', [
      {
        id: 1,
        username: 'adminUser',
        email: 'admin@example.com',
        password: '12345',
        roleId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 2,
        username: 'directorUser',
        email: 'director@example.com',
        password: '12345',
        roleId: 2,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 3,
        username: 'asesorUser',
        email: 'asesor@example.com',
        password: '12345',
        roleId: 3,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 4,
        username: 'recaudadorUser',
        email: 'recaudador@example.com',
        password: '12345',
        roleId: 4,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 5,
        username: 'coordinadorUser',
        email: 'coordinador@example.com',
        password: '12345',
        roleId: 5,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 6,
        username: 'fiscalUser',
        email: 'fiscal@example.com',
        password: '12345',
        roleId: 6,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 7,
        username: 'contribuyenteUser',
        email: 'contribuyente@example.com',
        password: '12345',
        roleId: 7,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('Users', null, {});
  },
};