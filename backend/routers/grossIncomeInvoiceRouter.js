// routes/grossIncomeInvoiceRouter.js
const express = require('express');
const router = express.Router();
const grossIncomeInvoiceController = require('../controllers/grossIncomeInvoiceController');

const passport = require('passport');

// GET all gross income invoices
router.get('/', grossIncomeInvoiceController.getAll);

router.get('/to-be-fixed', passport.authenticate('jwt', { session: false }), grossIncomeInvoiceController.getToBeFixed);

// GET a single gross income invoice by ID
router.get('/:id', grossIncomeInvoiceController.getById);

// POST a new gross income invoice
router.post('/', passport.authenticate('jwt', { session: false }), grossIncomeInvoiceController.create);

// PUT (update) an existing gross income invoice by ID
router.put('/:id', passport.authenticate('jwt', { session: false }), grossIncomeInvoiceController.update);

// DELETE a gross income invoice by ID
router.delete('/:id', passport.authenticate('jwt', { session: false }),  grossIncomeInvoiceController.delete);

// GET all gross income invoices with associated gross incomes
router.get('/with-gross-incomes', grossIncomeInvoiceController.getAllWithGrossIncomes);

// @deprecated
// POST update payment status of a gross income invoice
router.post('/:id/payment-status', grossIncomeInvoiceController.updatePaymentStatus);

// POST /gross-incomes/:id/payments/:paymentId
router.post('/:id/payments/:paymentId', passport.authenticate('jwt', { session: false }), grossIncomeInvoiceController.addPaymentToGrossIncomeInvoice);

router.put('/:id/fix-status', passport.authenticate('jwt', { session: false }), grossIncomeInvoiceController.updateFixStatus);

// DELETE /gross-incomes/:id/payments/:paymentId
router.delete('/:id/payments/:paymentId', passport.authenticate('jwt', { session: false }), grossIncomeInvoiceController.removePaymentFromGrossIncomeInvoice);

module.exports = router;