const express = require('express');
const router = express.Router();
const bankAccountController = require('../controllers/bankAccountController');

const passport = require('passport');

// GET all bank accounts
router.get('/', bankAccountController.getAll);

// GET a bank account by ID
router.get('/:id', bankAccountController.getById);

// POST a new bank account
router.post('/', passport.authenticate('jwt', { session: false }), bankAccountController.create);

// PUT (update) a bank account by ID
router.put('/:id', passport.authenticate('jwt', { session: false }), bankAccountController.update);

// DELETE a bank account by ID
router.delete('/:id', passport.authenticate('jwt', { session: false }), bankAccountController.delete);

module.exports = router;