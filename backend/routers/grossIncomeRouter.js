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
router.post('/',
  passport.authenticate('jwt', { session: false }), 
  grossIncomeController.create);

// PUT (update) an existing gross income by ID
router.put('/:id', 
  passport.authenticate('jwt', { session: false }),
  grossIncomeController.update);

// DELETE a gross income by ID
router.delete('/:id', 
  passport.authenticate('jwt', { session: false }),
  grossIncomeController.delete);

// POST declaration image
router.post('/declaration-image', 
  passport.authenticate('jwt', { session: false }),grossIncomeController.uploadDeclarationImage);

// GET all gross incomes by business ID
router.get('/business/:businessId', grossIncomeController.getAllGrossIncomesByBusinessId);

// @deprecated
// GET all gross incomes by invoice ID
router.get('/invoice/:invoiceId', grossIncomeController.getAllGrossIncomesByInvoiceId);

router.post('/:id/support-files', 
  passport.authenticate('jwt', { session: false }),
  grossIncomeController.addSupportFiles
);

router.delete('/:id/support-files', 
  passport.authenticate('jwt', { session: false }), 
  grossIncomeController.removeSupportFiles
);




module.exports = router;