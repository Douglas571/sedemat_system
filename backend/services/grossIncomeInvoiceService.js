// services/grossIncomeInvoiceService.js
const { GrossIncomeInvoice, GrossIncome } = require('../database/models');

class GrossIncomeInvoiceService {
    // Fetch all GrossIncomeInvoice records
    async getAllGrossIncomeInvoices() {
        return await GrossIncomeInvoice.findAll();
    }

    // Fetch a single GrossIncomeInvoice by ID
    async getGrossIncomeInvoiceById(id) {
        return await GrossIncomeInvoice.findByPk(id, {
            include: [
                {
                    model: GrossIncome,
                    as: 'grossIncomes'
                }
            ]
        });
    }

    // Create a new GrossIncomeInvoice record
    async createGrossIncomeInvoice(newGrossIncomeInvoice) {
        // return await GrossIncomeInvoice.create(newGrossIncomeInvoice);
        console.log("Executing gross income invoice create")

        if (newGrossIncomeInvoice?.grossIncomesIds?.length === 0) {
            throw new Error("Include at least one gross income id within grossIncomesIds")
        }

        const newRegisteredInvoice = await GrossIncomeInvoice.create(newGrossIncomeInvoice);
        await GrossIncome.update({ grossIncomeInvoiceId: newRegisteredInvoice.id }, { where: { id: newGrossIncomeInvoice.grossIncomesIds } });

        return {newGrossIncomeInvoice}
    }

    // Update an existing GrossIncomeInvoice record by ID
    async updateGrossIncomeInvoice(id, data) {
        const grossIncomeInvoice = await this.getGrossIncomeInvoiceById(id);
        if (!grossIncomeInvoice) {
            throw new Error('GrossIncomeInvoice not found');
        }
        return await grossIncomeInvoice.update(data);
    }

    // Delete a GrossIncomeInvoice record by ID
    async deleteGrossIncomeInvoice(id) {
        const grossIncomeInvoice = await this.getGrossIncomeInvoiceById(id);
        if (!grossIncomeInvoice) {
            throw new Error('GrossIncomeInvoice not found');
        }
        return await grossIncomeInvoice.destroy();
    }

    // Get all GrossIncomeInvoices with associated GrossIncomes
    async getAllGrossIncomeInvoicesWithGrossIncomes() {
        return await GrossIncomeInvoice.findAll({
            include: [
                {
                    model: GrossIncome,
                    as: 'grossIncomes'
                }
            ]
        });
    }

    // Update the isPaid status of a GrossIncomeInvoice
    async updateInvoicePaymentStatus(id, isPaid) {
        const grossIncomeInvoice = await this.getGrossIncomeInvoiceById(id);
        if (!grossIncomeInvoice) {
            throw new Error('GrossIncomeInvoice not found');
        }
        return await grossIncomeInvoice.update({ isPaid });
    }
}

module.exports = new GrossIncomeInvoiceService();