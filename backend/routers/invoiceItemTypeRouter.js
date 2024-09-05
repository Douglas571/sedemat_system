const express = require('express');
const InvoiceItemTypeController = require('../controllers/invoiceItemTypeController');

const router = express.Router();

router.post('/', InvoiceItemTypeController.create);
router.get('/', InvoiceItemTypeController.findAll);
router.get('/:id', InvoiceItemTypeController.findById);
router.put('/:id', InvoiceItemTypeController.update);
router.delete('/:id', InvoiceItemTypeController.delete);

module.exports = router;
