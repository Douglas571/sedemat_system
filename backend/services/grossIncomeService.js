// services/grossIncomeService.js
const { GrossIncome } = require('../database/models');

class GrossIncomeService {
    // Fetch all GrossIncome records
    async getAllGrossIncomes() {
        return await GrossIncome.findAll();
    }

    // Fetch a single GrossIncome by ID
    async getGrossIncomeById(id) {
        return await GrossIncome.findByPk(id);
    }

    // Create a new GrossIncome record
    async createGrossIncome(data) {
        return await GrossIncome.create(data);
    }

    // Update an existing GrossIncome record by ID
    async updateGrossIncome(id, data) {
        const grossIncome = await this.getGrossIncomeById(id);
        if (!grossIncome) {
            throw new Error('GrossIncome not found');
        }
        return await grossIncome.update(data);
    }

    // Delete a GrossIncome record by ID
    async deleteGrossIncome(id) {
        const grossIncome = await this.getGrossIncomeById(id);
        if (!grossIncome) {
            throw new Error('GrossIncome not found');
        }
        return await grossIncome.destroy();
    }
}

module.exports = new GrossIncomeService();