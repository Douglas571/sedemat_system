const { Sequelize } = require('sequelize');
const { QueryTypes } = require('sequelize');

const createdByUserId = 8; // Set the user ID for file creation

module.exports = {
  up: async (queryInterface) => {
    // Fetch all GrossIncome records with a declarationImage
    let grossIncomes = await queryInterface.sequelize.query(
      `SELECT id, declarationImage FROM GrossIncomes WHERE declarationImage IS NOT NULL AND declarationImage <> ''`,
      { type: QueryTypes.SELECT }
    );

    // Arrays to hold the new File and SupportFilesToGrossIncomes records
    const files = [];
    const supportFilesToGrossIncomes = [];

    // Generate data for each GrossIncome record
    grossIncomes.forEach((grossIncome, index) => {
      const fileId = index + 1; // Generate a sequential ID for the File object

      // Create the File object
      files.push({
        id: fileId,
        path: grossIncome.declarationImage,
        type: 'image',
        folder: 'grossIncome',
        createdByUserId,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Create the SupportFilesToGrossIncomes object
      supportFilesToGrossIncomes.push({
        grossIncomeId: grossIncome.id,
        fileId,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    });

    // Insert the File records into the Files table
    await queryInterface.bulkInsert('Files', files);

    // Insert the SupportFilesToGrossIncomes records into the SupportFilesToGrossIncomes table
    await queryInterface.bulkInsert('SupportFilesToGrossIncomes', supportFilesToGrossIncomes);
  },

  down: async (queryInterface) => {
    // Delete all entries from SupportFilesToGrossIncomes and Files
    await queryInterface.bulkDelete('SupportFilesToGrossIncomes', null, {});
    await queryInterface.bulkDelete('Files', null, {});
  },
};
