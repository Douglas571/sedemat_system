const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const economicActivities = [];
    const alicuotas = [];

    // Path to the CSV file
    const csvFilePath = path.join(__dirname, 'economicActivities.csv');

    return new Promise((resolve, reject) => {
      fs.createReadStream(csvFilePath)
        .pipe(csv())
        .on('data', (row) => {
          // Create entry for EconomicActivities
          economicActivities.push({
            id: row.id,
            code: row.code,
            title: row.title,
            alicuota: parseFloat(row.alicuota),
            minimumTax: parseFloat(row.minimumTax),
            createdAt: new Date(),
            updatedAt: new Date(),
          });

          // Create entry for Alicuota (assuming you want to save similar data)
          alicuotas.push({
            id: row.id,
            economicActivityId: row.id,
            taxPercent: parseFloat(row.alicuota),
            minTaxMMV: parseFloat(row.minimumTax),
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        })
        .on('end', async () => {
          try {
            // Start a transaction to ensure consistency
            await queryInterface.sequelize.transaction(async (transaction) => {
              // Bulk insert into EconomicActivities table
              await queryInterface.bulkInsert('EconomicActivities', economicActivities, { transaction });

              // Bulk insert into Alicuota table
              await queryInterface.bulkInsert('Alicuotas', alicuotas, { transaction });
            });
            resolve();
          } catch (error) {
            reject(error);
          }
        })
        .on('error', reject);
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Optional: remove data from both tables on rollback
    await queryInterface.bulkDelete('EconomicActivities', null, {});
    await queryInterface.bulkDelete('Alicuotas', null, {});
  },
};
