// routes/grossIncomeInvoiceRouter.js
const express = require('express');
const router = express.Router();
const grossIncomeInvoiceController = require('../controllers/grossIncomeInvoiceController');

// GET all gross income invoices
router.get('/', grossIncomeInvoiceController.getAll);

// GET a single gross income invoice by ID
router.get('/:id', grossIncomeInvoiceController.getById);

// POST a new gross income invoice
router.post('/', grossIncomeInvoiceController.create);

// PUT (update) an existing gross income invoice by ID
router.put('/:id', grossIncomeInvoiceController.update);

// DELETE a gross income invoice by ID
router.delete('/:id', grossIncomeInvoiceController.delete);

// GET all gross income invoices with associated gross incomes
router.get('/with-gross-incomes', grossIncomeInvoiceController.getAllWithGrossIncomes);

// POST update payment status of a gross income invoice
router.post('/:id/payment-status', grossIncomeInvoiceController.updatePaymentStatus);

// POST /gross-incomes/:id/payments/:paymentId
router.post('/:id/payments/:paymentId', grossIncomeInvoiceController.addPaymentToGrossIncomeInvoice);

// DELETE /gross-incomes/:id/payments/:paymentId
router.delete('/:id/payments/:paymentId', grossIncomeInvoiceController.removePaymentFromGrossIncomeInvoice);

module.exports = router;