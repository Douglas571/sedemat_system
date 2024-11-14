// controllers/grossIncomeInvoiceController.js
const grossIncomeInvoiceService = require('../services/grossIncomeInvoiceService');

class GrossIncomeInvoiceController {
    // GET /gross-income-invoices
    async getAll(req, res) {
        try {
            const grossIncomeInvoices = await grossIncomeInvoiceService.getAllGrossIncomeInvoices();
            res.status(200).json(grossIncomeInvoices);
        } catch (error) {
            console.log({error})
            res.status(500).json({ error: error.message });
        }
    }

    // GET /gross-income-invoices/:id
    async getById(req, res) {
        try {
            const grossIncomeInvoice = await grossIncomeInvoiceService.getGrossIncomeInvoiceById(req.params.id);
            if (!grossIncomeInvoice) {
                return res.status(404).json({ message: 'GrossIncomeInvoice not found' });
            }
            res.status(200).json(grossIncomeInvoice);
        } catch (error) {
            console.log({ error })
            res.status(500).json({ error: error.message });
        }
    }

    // POST /gross-income-invoices
    async create(req, res) {

        let user = req.user 
        let data = req.body
        try {
            const newGrossIncomeInvoice = await grossIncomeInvoiceService.createGrossIncomeInvoice(data, user);
            res.status(201).json(newGrossIncomeInvoice);
        } catch (error) {
            console.log({ error })
            res.status(error.statusCode ?? 500).json({ error: error });
        }
    }

    // PUT /gross-income-invoices/:id
    async update(req, res) {
        try {
            let user = req.user

            const updatedGrossIncomeInvoice = await grossIncomeInvoiceService.updateGrossIncomeInvoice(req.params.id, req.body, user);
            

            // look for a settlement with the invoice id and update its gross income
            

            res.status(200).json(updatedGrossIncomeInvoice);
        } catch (error) {
            console.log({ error })
            res.status(error.statusCode ?? 500).json({ error });
        }
    }

    // DELETE /gross-income-invoices/:id
    async delete(req, res) {
        try {
            await grossIncomeInvoiceService.deleteGrossIncomeInvoice(req.params.id);
            res.status(204).send();
        } catch (error) {
            console.log({ error })
            res.status(error.statusCode ?? 500).json({ error });
        }
    }

    // GET /gross-income-invoices/with-gross-incomes
    async getAllWithGrossIncomes(req, res) {
        try {
            const grossIncomeInvoices = await grossIncomeInvoiceService.getAllGrossIncomeInvoicesWithGrossIncomes();
            res.status(200).json(grossIncomeInvoices);
        } catch (error) {
            console.log({ error });
            res.status(500).json({ error: error.message });
        }
    }

    // PATCH /gross-income-invoices/:id/payment-status
    async updatePaymentStatus(req, res) {
        try {
            const { isPaid } = req.body;
            const updatedGrossIncomeInvoice = await grossIncomeInvoiceService.updateInvoicePaymentStatus(req.params.id, isPaid);
            res.status(200).json(updatedGrossIncomeInvoice);
        } catch (error) {
            console.log({ error });
            res.status(error.statusCode ?? 500).json({ error });
        }
    }

    // PATCH /gross-income-invoices/:id/payment/:paymentId
    async addPaymentToGrossIncomeInvoice(req, res) {
        try {
            const { id, paymentId } = req.params;
            const updatedGrossIncomeInvoice = await grossIncomeInvoiceService.addPayment(id, paymentId, req.user);
            res.status(200).json(updatedGrossIncomeInvoice);
        } catch (error) {
            console.log({ error });
            res.status(error.statusCode ?? 500).json({ error });
        }
    }

    // PATCH /gross-income-invoices/:id/payment/:paymentId
    async removePaymentFromGrossIncomeInvoice(req, res) {
        try {
            const { id, paymentId } = req.params;
            const updatedGrossIncomeInvoice = await grossIncomeInvoiceService.removePayment(id, paymentId, req.user);
            res.status(200).json(updatedGrossIncomeInvoice);
        } catch (error) {
            console.log({ error });
            res.status(error.statusCode ?? 500).json({ error });
        }
    }
}

module.exports = new GrossIncomeInvoiceController();