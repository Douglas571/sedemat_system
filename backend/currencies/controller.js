// i need a route to get the dolar and euro exchange rate to bolivares

// the route should be /currencies


// the routes should call the service get currency
    // it is a web scraper that get the html from the page https://www.bcv.org.ve/
    // euros exchange rate is in the second div inside #euro.row
    // dolar exchange rate is in the second div inside #dolar.row

    // the values should be save in a global variable and refreshed when the server start and every 5 hours 

const express = require('express');
const router = express.Router();
const currencyService = require('./services');

router.get('/', async (req, res) => {
    const exchangeRates = await currencyService.getExchangeRates();
    console.log({exchangeRates})
    res.json(exchangeRates);
});

module.exports = router;