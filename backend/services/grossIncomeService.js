// services/grossIncomeService.js
const { GrossIncome, BranchOffice } = require('../database/models');

class GrossIncomeService {
    // Fetch all GrossIncome records
    async getAllGrossIncomes() {
        return await GrossIncome.findAll();
    }

    // Fetch a single GrossIncome by ID
    async getGrossIncomeById(id) {
        return await GrossIncome.findByPk(id, {
            include: [
                {
                    model: BranchOffice,
                    as: 'branchOffice'
                }
            ]
        });
    }

    // Create a new GrossIncome record
    async createGrossIncome(data) {
        return await GrossIncome.create(data);
    }

    // Update an existing GrossIncome record by ID
    async updateGrossIncome(id, data) {
        const grossIncome = await this.getGrossIncomeById(id, {
            include: [
                {
                    model: BranchOffice,
                    as: 'branchOffice'
                }
            ]
        });
        if (!grossIncome) {
            throw new Error('GrossIncome not found');
        }
        console.log('grossIncome', grossIncome.toJSON())
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

    async getAllGrossIncomesByBusinessId(businessId) {
        return await GrossIncome.findAll({
            where: {
                businessId: businessId
            },
            include: [
                {
                    model: BranchOffice,
                    as: 'branchOffice'
                }
            ]
        });
    }
}

module.exports = new GrossIncomeService();