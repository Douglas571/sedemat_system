'use strict';
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const vehicleTypes = [];
    const filePath = path.resolve(__dirname, 'vehicleTypes.csv');

    return new Promise((resolve, reject) => {
      fs.createReadStream(filePath)
        .pipe(csv({ 
          separator: ';',
          mapHeaders: ({ header, index }) => header.trim()
        })) // Use semicolon as the separator
        .on('data', (row) => {
          vehicleTypes.push({
            id: parseInt(row.id),
            type: row.type,
            taxMMVBCV: parseFloat(row.taxMMVBCV),
            // isValid: true, disabled for now,
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        })
        .on('end', () => {
          queryInterface.bulkInsert('vehicleTypes', vehicleTypes)
            .then(() => resolve())
            .catch((error) => reject(error));
        })
        .on('error', (error) => reject(error));
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Remove all data from the vehicle_types table
    return queryInterface.bulkDelete('vehicleTypes', null, {});
  },
};