// services/grossIncomeInvoiceService.js
const { GrossIncomeInvoice, GrossIncome, CurrencyExchangeRates, Payment } = require('../database/models');

class GrossIncomeInvoiceService {
    // Fetch all GrossIncomeInvoice records
    async getAllGrossIncomeInvoices() {
        return await GrossIncomeInvoice.findAll({
            include: [
                {
                    model: GrossIncome,
                    as: 'grossIncomes'
                }
            ]
        });
    }

    // Fetch a single GrossIncomeInvoice by ID
    async getGrossIncomeInvoiceById(id) {
        return await GrossIncomeInvoice.findByPk(id, {
            include: [
                {
                    model: GrossIncome,
                    as: 'grossIncomes',
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
        console.log({id})
        const grossIncomeInvoice = await this.getGrossIncomeInvoiceById(id);
        if (!grossIncomeInvoice) {
            throw new Error('GrossIncomeInvoice not found');
        }

        // check if should add new gross incomes 
        if (data?.grossIncomesIds?.length > 0) {
            await GrossIncome.update({ grossIncomeInvoiceId: id }, { where: { id: data.grossIncomesIds } });
        }

        // check if should remove gross incomes
        if (data?.removeGrossIncomesIds?.length > 0) {
            await GrossIncome.update({ grossIncomeInvoiceId: null }, { where: { id: data.removeGrossIncomesIds } });
        }

        return await grossIncomeInvoice.update(data);
    }

    // Delete a GrossIncomeInvoice record by ID
    async deleteGrossIncomeInvoice(id) {

        await GrossIncome.update({ grossIncomeInvoiceId: null }, { where: { grossIncomeInvoiceId: id } });

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

    async addPayment(grossIncomeInvoiceId, paymentId) {
        // lock for the payment and add the gross income id
        console.log({grossIncomeInvoiceId, paymentId})
        const payment = await Payment.findByPk(paymentId)

        if (payment.grossIncomeInvoiceId) {
            throw new Error('This payment is already associated with an invoice.');
        }

        payment.grossIncomeInvoiceId = grossIncomeInvoiceId
        await payment.save()

        return payment
    }

    async removePayment(paymentId) {
        console.log({paymentId})
        const payment = await Payment.findByPk(paymentId)
        payment.grossIncomeInvoiceId = null
        await payment.save()
        return payment
    }
}

module.exports = new GrossIncomeInvoiceService();