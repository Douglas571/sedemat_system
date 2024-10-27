// routes/grossIncomeRouter.js
const express = require('express');
const router = express.Router();
const grossIncomeController = require('../controllers/grossIncomeController');

const passport = require('passport');

// UTILS
router.post('/undeclared',
  passport.authenticate('jwt', { session: false }),
  grossIncomeController.createUndeclaredGrossIncome);

// GET all gross incomes
router.get('/', grossIncomeController.getAll);

// GET a single gross income by ID
router.get('/:id', grossIncomeController.getById);

// POST a new gross income
router.post('/', grossIncomeController.create);

// PUT (update) an existing gross income by ID
router.put('/:id', grossIncomeController.update);

// DELETE a gross income by ID
router.delete('/:id', grossIncomeController.delete);


// POST declaration image
router.post('/declaration-image', grossIncomeController.uploadDeclarationImage);

// GET all gross incomes by business ID
router.get('/business/:businessId', grossIncomeController.getAllGrossIncomesByBusinessId);

// GET all gross incomes by invoice ID
router.get('/invoice/:invoiceId', grossIncomeController.getAllGrossIncomesByInvoiceId);



module.exports = router;