const axios = require('axios');
const cheerio = require('cheerio');

let exchangeRates = {
    dolar: null,
    euro: null
};

async function fetchExchangeRates() {
    try {
        const response = await axios.get('https://www.bcv.org.ve/');
        const $ = cheerio.load(response.data);

        console.log({result: Number($('#dolar .field-content .row div:nth-child(2)').text().trim().replace(',', '.'))})

        const dolarRate = Number($('#dolar .field-content .row div:nth-child(2)').text().trim().replace(',', '.'));
        const euroRate = Number($('#euro .field-content .row div:nth-child(2)').text().trim().replace(',', '.'));

        exchangeRates.dolar = dolarRate;
        exchangeRates.euro = euroRate;

        console.log('Exchange rates updated:', exchangeRates);

        return exchangeRates
    } catch (error) {
        console.error('Error fetching exchange rates:', error);
    }
}

// Fetch the rates when the server starts and every 5 hours
fetchExchangeRates();
setInterval(fetchExchangeRates, 5 * 60 * 60 * 1000); // 5 hours

module.exports = {
    getExchangeRates: async () => await fetchExchangeRates() //exchangeRates
};