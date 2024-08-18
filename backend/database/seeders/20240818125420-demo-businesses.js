'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('Businesses', [
      {
        businessName: 'Supermercado El Central',
        dni: 'J-12345678-9',
        email: 'contacto@elcentral.com.ve',
        companyIncorporationDate: new Date('2005-03-15'),
        companyExpirationDate: new Date('2030-03-15'),
        directorsBoardExpirationDate: new Date('2025-03-15'),
        economicActivityId: 1, // Assume this corresponds to "Retail"
        ownerPersonId: 1, // Corresponds to an existing Person
        accountantPersonId: 2, // Corresponds to an existing Person
        administratorPersonId: 3, // Corresponds to an existing Person
        preferredChannel: 'email',
        sendCalculosTo: 'finance@elcentral.com.ve',
        preferredContact: 'Jose Perez',
        reminderInterval: 30,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        businessName: 'Panadería La Gran Meru',
        dni: 'J-98765432-1',
        email: 'ventas@lagranmeru.com',
        companyIncorporationDate: new Date('2010-07-20'),
        companyExpirationDate: new Date('2040-07-20'),
        directorsBoardExpirationDate: new Date('2028-07-20'),
        economicActivityId: 2, // Assume this corresponds to "Bakery"
        ownerPersonId: 4, // Corresponds to an existing Person
        accountantPersonId: 5, // Corresponds to an existing Person
        administratorPersonId: 6, // Corresponds to an existing Person
        preferredChannel: 'phone',
        sendCalculosTo: 'admin@lagranmeru.com',
        preferredContact: 'Maria Gonzalez',
        reminderInterval: 15,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        businessName: 'Ferretería Los Andes',
        dni: 'J-45678901-2',
        email: 'info@ferreterialosandes.com.ve',
        companyIncorporationDate: new Date('2000-02-10'),
        companyExpirationDate: new Date('2025-02-10'),
        directorsBoardExpirationDate: new Date('2024-02-10'),
        economicActivityId: 3, // Assume this corresponds to "Hardware Store"
        ownerPersonId: 7, // Corresponds to an existing Person
        accountantPersonId: 8, // Corresponds to an existing Person
        administratorPersonId: 9, // Corresponds to an existing Person
        preferredChannel: 'email',
        sendCalculosTo: 'contacto@ferreterialosandes.com.ve',
        preferredContact: 'Pedro Morales',
        reminderInterval: 60,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        businessName: 'Carnicería Los Llanos',
        dni: 'J-11122333-4',
        email: 'ventas@carnicerialosllanos.com',
        companyIncorporationDate: new Date('2015-11-25'),
        companyExpirationDate: new Date('2035-11-25'),
        directorsBoardExpirationDate: new Date('2030-11-25'),
        economicActivityId: 4, // Assume this corresponds to "Butchery"
        ownerPersonId: 10, // Corresponds to an existing Person
        accountantPersonId: 11, // Corresponds to an existing Person
        administratorPersonId: 12, // Corresponds to an existing Person
        preferredChannel: 'whatsapp',
        sendCalculosTo: 'admin@carnicerialosllanos.com',
        preferredContact: 'Luis Ramirez',
        reminderInterval: 45,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        businessName: 'Farmacia El Sol',
        dni: 'J-22233444-5',
        email: 'farmacia@elsol.com.ve',
        companyIncorporationDate: new Date('2003-05-10'),
        companyExpirationDate: new Date('2028-05-10'),
        directorsBoardExpirationDate: new Date('2025-05-10'),
        economicActivityId: 5, // Assume this corresponds to "Pharmacy"
        ownerPersonId: 13, // Corresponds to an existing Person
        accountantPersonId: 14, // Corresponds to an existing Person
        administratorPersonId: 15, // Corresponds to an existing Person
        preferredChannel: 'email',
        sendCalculosTo: 'admin@farmaciaelsol.com.ve',
        preferredContact: 'Ana Blanco',
        reminderInterval: 30,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Businesses', null, {});
  }
};
