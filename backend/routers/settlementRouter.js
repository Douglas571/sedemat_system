// routes/settlements.js
const express = require('express');
const router = express.Router();
const settlementController = require('../controllers/settlementController');

router.post('/', settlementController.create);
router.get('/', settlementController.getAll);
router.get('/:id', settlementController.getById);
router.put('/:id', settlementController.update);
router.delete('/:id', settlementController.delete);

module.exports = router;
