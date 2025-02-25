'use strict';
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const { Person, Vehicle } = require('../models'); // Adjust the path to your models

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const vehicles = [];
    const ownersMap = new Map(); // To store owners and avoid duplicates
    const filePath = path.resolve(__dirname, 'vehicles.csv'); // Path to your CSV file

    return new Promise((resolve, reject) => {
      fs.createReadStream(filePath)
        .pipe(csv({ separator: ';' })) // Use semicolon as the separator
        .on('data', (row) => {
          let { ownerName, dni, plate, createdAt, brand, model, year, color, vehicleTypeId, usage } = row;

          // Skip vehicles with owners whose DNI starts with "J" or has more than two '-'
          if (dni.startsWith('J') || (dni.match(/-/g) || []).length > 2) {
            return;
          }

          // Format the DNI
          const cleanedDni = dni.replace(/[.-]/g, ''); // Remove dots and dashes
          const formattedDni = cleanedDni.slice(0, 1) + '-' + cleanedDni.slice(1); // Add a '-' between the 1st and 2nd character
          const finalDni = formattedDni.replace(/(\d)(?=(\d{3})+$)/g, '$1.'); // Add a dot every 3 characters from the end

          // Add owner to the map if not already present
          if (!ownersMap.has(finalDni)) {
            ownersMap.set(finalDni, {
              dni: finalDni,
              firstName: ownerName, // Use the first name only
              lastName: '', // Leave last name empty
              createdAt: new Date(),
              updatedAt: new Date(),
            });
          }

          let [day, month, yearCreatedAt] = createdAt.split('/')
          createdAt = new Date(Number(yearCreatedAt), Number(month) - 1, Number(day))

          let isPublicTransport = [4, 5, 6].includes(vehicleTypeId)

          // Add vehicle to the list
          vehicles.push({
            plate,
            brand,
            model,
            year, // Convert year to a Date object
            color,
            isPublicTransport,
            vehicleTypeId: parseInt(vehicleTypeId, 10),
            ownerId: null, // Will be updated after inserting owners
            ownerDni: finalDni,
            usage,
            createdAt: new Date(), // Convert createdAt to a Date object
            updatedAt: new Date(),
          });
        })
        .on('end', async () => {
          try {
            console.log(vehicles)
            // Insert owners into the people table
            const owners = Array.from(ownersMap.values());
            await queryInterface.bulkInsert('people', owners);

            // Fetch all owners to map DNI to ID
            const allOwners = await Person.findAll();
            const ownerIdMap = new Map(allOwners.map(owner => [owner.dni, owner.id]));

            // Update vehicles with ownerId
            vehicles.forEach(vehicle => {
              const ownerDni = vehicle.ownerDni; // Assuming ownerDni is stored temporarily
              vehicle.ownerId = ownerIdMap.get(ownerDni);
              delete vehicle.ownerDni; // Remove temporary field
            });

            // Insert vehicles into the vehicles table
            await queryInterface.bulkInsert('vehicles', vehicles);
            resolve();
          } catch (error) {
            reject(error);
          }
        })
        .on('error', (error) => reject(error));
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Remove all data from the vehicles and people tables
    await queryInterface.bulkDelete('vehicles', null, {});
    await queryInterface.bulkDelete('people', null, {});
  },
};