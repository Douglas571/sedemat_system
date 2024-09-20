const express = require('express');
const router = express.Router();
const bankAccountController = require('../controllers/bankAccountController');

// GET all bank accounts
router.get('/', bankAccountController.getAll);

// GET a bank account by ID
router.get('/:id', bankAccountController.getById);

// POST a new bank account
router.post('/', bankAccountController.create);

// PUT (update) a bank account by ID
router.put('/:id', bankAccountController.update);

// DELETE a bank account by ID
router.delete('/:id', bankAccountController.delete);

module.exports = router;