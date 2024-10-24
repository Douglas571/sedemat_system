const fs = require('fs');
const csv = require('csv-parser');
const path = require('path');
const { Sequelize } = require('sequelize');
const { EconomicActivity, Business } = require('../models'); // Ensure your models are correctly imported

module.exports = {
  async up(queryInterface, Sequelize) {
    // Step 1: Read Economic Activities CSV
    const economicActivitiesFilePath = path.resolve(__dirname, 'economicActivities.csv');
    const businessDataFilePath = path.resolve(__dirname, 'businessDataOctober2024.csv');

    const economicActivities = [];
    const businesses = [];
    const branchOffices = [];

    // Step 2: Load Economic Activities into memory (code -> id mapping)
    await new Promise((resolve, reject) => {
      fs.createReadStream(economicActivitiesFilePath)
        .pipe(csv())
        .on('data', (row) => {
          economicActivities.push({
            code: row.code,
            id: row.id,
          });
        })
        .on('end', resolve)
        .on('error', reject);
    });

    // // Step 3: Fetch Economic Activity IDs from the database
    // const dbEconomicActivities = await EconomicActivity.findAll({
    //   where: {
    //     code: economicActivities.map((ea) => ea.code),
    //   },
    // });

    // Step 4: Map each economic activity code to its corresponding ID
    const codeToIdMap = economicActivities.reduce((acc, activity) => {
      acc[activity.code] = activity.id;
      return acc;
    }, {});

    const ids = [];

    // Step 5: Read Business Data CSV and filter valid entries
    await new Promise((resolve, reject) => {
      fs.createReadStream(businessDataFilePath)
        .pipe(csv())
        .on('data', (row) => {
          // Check for required fields (dni and EconomicActivityCode)
          if (row.dni && row.EconomicActivityCode) {
            const economicActivityId = codeToIdMap[row.EconomicActivityCode];

            // Only insert businesses with valid EconomicActivityCode mappings


            if (economicActivityId && !ids.includes(row.id)) {

              businesses.push({
                id: row.id,
                businessName: row.businessName,
                dni: row.dni,                
                
                economicActivityId, // Mapped to the actual economicActivityId

                // zona: row.ZONA,
                // branchOfficeBusinessId: row.branchOfficeBusinessId,
                // address: row.DIRECCION,
                // legalRepresentative: row['REPRESENTANTE LEGAL'],
                // legalRepresentativeDni: row.CEDULA,
                // phone: row.TELEFONO,
                // email: row['CORREO ELECTRONICO'],
                // accountant: row.CONTADOR,
                // accountantPhone: row['TELEFONO CONTADOR'],
                // contactDate: row['FECHA DE CONTACTO'],
                // observation: row.OBSERVACION,
                createdAt: new Date(),
                updatedAt: new Date(),
              });
              ids.push(row.id);
            }

            branchOffices.push({
              nickname: row.sede ? row.sede.toUpperCase() : 'PRINCIPAL',
              businessId: row.id,
              address: row.DIRECCION.toUpperCase(),
              zone: row.ZONA.toUpperCase(),
              dimensions: 30,
              type: 'I',
              createdAt: new Date(),
              updatedAt: new Date(),
            })
          }
        })
        .on('end', resolve)
        .on('error', reject);
    });

    // Step 6: Perform bulk insert into the Business table
    if (businesses.length > 0) {
      await queryInterface.sequelize.transaction(async (transaction) => {
        await queryInterface.bulkInsert('Businesses', businesses, { transaction });
        await queryInterface.bulkInsert('BranchOffices', branchOffices, { transaction });
      });
      
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Businesses', null, {});
    await queryInterface.bulkDelete('BranchOffices', null, {});
  },
};
