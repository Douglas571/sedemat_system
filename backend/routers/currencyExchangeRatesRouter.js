const express = require('express');
const CurrencyExchangeRatesController = require('../controllers/currencyExchangeRatesController')

const router = express.Router();

router.get('/fetch-from-bcv', CurrencyExchangeRatesController.fetchFromBCV)

router.post('/', CurrencyExchangeRatesController.create);
router.get('/', CurrencyExchangeRatesController.getAll);
router.get('/:id', CurrencyExchangeRatesController.getById);
router.put('/:id', CurrencyExchangeRatesController.update);
router.delete('/:id', CurrencyExchangeRatesController.delete);

module.exports = router;