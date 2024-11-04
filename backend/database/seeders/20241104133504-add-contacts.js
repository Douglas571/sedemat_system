'use strict';

const fs = require('fs');
const csv = require('csv-parser');

/** @type {import('sequelize-cli').Migration} */

async function readCsvFile(pathToContactsCsv) {
  const rows = [];
  fs.createReadStream(pathToContactsCsv)
    .pipe(csv())
    .on('data', (row) => {
      rows.push(row);
    })
    .on('end', () => {
      return rows;
    });
}

module.exports = {
  async up (queryInterface, Sequelize) {
    let contacts = [];

    const rows = await readCsvFile('contacts.csv');

    // Iterate over all contact rows
    rows.forEach((row) => {
      const currentBusinessId = row.businessId;

      // Extract owner contact
      const ownerContact = {
        id: row.ownerId,
        fullName: row.ownerFullName,
        dni: row.ownerDni,
        phone: row.ownerPhone,
        email: row.ownerEmail,
        isOwner: true,
        businessId: [currentBusinessId],
      };

      // Extract accountant contact
      const accountantContact = {
        id: row.accountantId,
        fullName: row.accountattFullName,
        dni: row.accountantDni,
        phone: row.accountantPhone,
        isOwner: false,
        businessId: [currentBusinessId],
      };

      // Create variables to track new owners and accountants
      let isANewOwner = true;
      let isANewAccountant = true;

      // Map existing contacts array
      contacts = contacts.map((currentContact) => {
        if (currentContact.id === row.ownerId) {
          currentContact.businessesIds.push(currentBusinessId);
          isANewOwner = false;
        }
        if (currentContact.id === row.accountantId) {
          currentContact.businessesIds.push(currentBusinessId);
          isANewAccountant = false;
        }
        return currentContact;
      });

      // Add new owner and accountant to contacts array if necessary
      if (isANewOwner) {
        contacts.push(ownerContact);
      }
      if (isANewAccountant) {
        contacts.push(accountantContact);
      }
    });

    console.log({contacts});

    // await queryInterface.bulkInsert('Contacts', contacts, {});
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
  }
};
