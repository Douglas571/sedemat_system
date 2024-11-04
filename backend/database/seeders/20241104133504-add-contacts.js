'use strict';

const fs = require('fs');
const csv = require('csv-parser');
const path = require('path');

/** @type {import('sequelize-cli').Migration} */

async function readCsvFile(pathToContactsCsv) {
  return new Promise((resolve, reject) => {
    const rows = [];
    fs.createReadStream(pathToContactsCsv)
      .pipe(csv())
      .on('data', (row) => {
        rows.push(row);
      })
      .on('end', () => {
        resolve(rows);
      })
      .on('error', reject);
  });
}

module.exports = {
  async up (queryInterface, Sequelize) {
    let contacts = [];

    const rows = await readCsvFile(path.resolve(__dirname, 'contacts.csv'));
    // console.log({rows});

    // Iterate over all contact rows
    rows.forEach((row) => {
      const currentBusinessId = row.businessId;

      // Extract owner contact
      const ownerContact = {
        id: row.ownerId,
        // fullName: row.ownerFullName,
        firstName: row.ownerFullName, // row.ownerFullName?.split(' ')[0] || '',
        lastName: '', // row.ownerFullName?.split(' ')[1] || '',
        dni: row.ownerDni,
        phone: row.ownerPhone,
        email: row.ownerEmail,
        isOwner: true,
        businessesIds: [Number(currentBusinessId)],
      };

      // Extract accountant contact
      const accountantContact = {
        id: row.accountantId,
        // fullName: row.accountantFullName,
        firstName: row.accountantFullName, // row.accountantFullName?.split(' ')[0] || '',
        lastName: '', // row.accountantFullName?.split(' ')[1] || '',
        dni: row.accountantDni,
        phone: row.accountantPhone,
        isOwner: false,
        businessesIds: [Number(currentBusinessId)],
      };

      // Create variables to track new owners and accountants
      let isANewOwner = true;
      let isANewAccountant = true;

      // Map existing contacts array
      contacts = contacts.map((currentContact) => {
        // console.log({currentContact});
        if (currentContact.id === row.ownerId) {
          currentContact.businessesIds.push(Number(currentBusinessId));
          isANewOwner = false;
        }
        if (currentContact.id === row.accountantId) {
          currentContact.businessesIds.push(Number(currentBusinessId));
          isANewAccountant = false;
        }
        return currentContact;
      });

      // Add new owner and accountant to contacts array if necessary
      if (isANewOwner && ownerContact.id) {
        contacts.push(ownerContact);
      }
      if (isANewAccountant && accountantContact.id) {
        contacts.push(accountantContact);
      }
    });

    // console.log({contacts});

    let contactsFormatted = contacts.map(contact => {
      let newObject = { ...contact, isOwner: undefined, createdAt: new Date(), updatedAt: new Date() }

      delete newObject.isOwner;
      delete newObject.businessesIds;

      return newObject
    })

    // console.log({contactsFormatted})

    await queryInterface.sequelize.transaction(async (transaction) => {

      await queryInterface.bulkInsert('People', contactsFormatted, { transaction });

      for (const contact of contacts) {
        await queryInterface.bulkUpdate('Businesses', {
          ownerPersonId: contact.isOwner ? contact.id : null,
          accountantPersonId: !contact.isOwner ? contact.id : null
        }, {
          id: contact.businessesIds
        }, { transaction })
      }

    })

    // await queryInterface.bulkInsert('Contacts', contacts, {});
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */

    const rows = await readCsvFile(path.resolve(__dirname, 'contacts.csv'));

    let businessesIds = []
    let ownerPersonId = []
    let accountantPersonId = []

    rows.forEach((row) => {
      businessesIds.push(row.businessId)
      ownerPersonId.push(row.ownerId)
      accountantPersonId.push(row.accountantId)
    })

    await queryInterface.bulkUpdate('Businesses', {
      ownerPersonId: null,
      accountantPersonId: null
    }, {
      id: businessesIds
    })

    await queryInterface.bulkDelete('People', {
      id: [...ownerPersonId, ...accountantPersonId]
    })
  }
};
