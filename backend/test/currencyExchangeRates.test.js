const request = require('supertest');
const app = require('../app'); // Adjust the path to your app
const { CurrencyExchangeRates } = require('../database/models'); // Adjust the path to your model

const CurrencyExchangeRatesService = require('../services/currencyExchangeRatesService')

describe('CurrencyExchangeRates API', () => {
    let expect;
    let exchangeRateId;

    before(async () => {
        // Dynamically import chai
        ({ expect } = await import('chai'));
    });

    after(async () => {
        // Clean up any data created during the tests
        if (exchangeRateId) {
            await CurrencyExchangeRates.destroy({ where: { id: exchangeRateId } });
        }
    });

    it('should create a new currency exchange rate', async () => {
        const res = await request(app)
            .post('/v1/currency-exchange-rates')
            .send({
                dolarBCVToBs: 35.5,
                eurosBCVToBs: 38.2,
                dolarBlackToBs: 45.6,
                euroBlackToBs: 49.3,
            });

        expect(res.status).to.equal(201);
        expect(res.body).to.have.property('id');
        exchangeRateId = res.body.id;
    });

    it('should get all currency exchange rates', async () => {
        const res = await request(app).get('/v1/currency-exchange-rates');

        expect(res.status).to.equal(200);
        expect(res.body).to.be.an('array');
    });

    it('should get a currency exchange rate by id', async () => {
        const res = await request(app).get(`/v1/currency-exchange-rates/${exchangeRateId}`);

        expect(res.status).to.equal(200);
        expect(res.body).to.have.property('id', exchangeRateId);
    });

    it('should update a currency exchange rate', async () => {
        const res = await request(app)
            .put(`/v1/currency-exchange-rates/${exchangeRateId}`)
            .send({
                dolarBCVToBs: 36.0,
                eurosBCVToBs: 39.0,
                dolarBlackToBs: 46.0,
                euroBlackToBs: 50.0,
            });

        expect(res.status).to.equal(200);
        expect(res.body).to.have.property('dolarBCVToBs', 36.0);
    });

    it('should delete a currency exchange rate', async () => {
        const res = await request(app).delete(`/v1/currency-exchange-rates/${exchangeRateId}`);

        expect(res.status).to.equal(204);
    });

    it('should fetch rates from BCV and save to database', async () => {
        const res = await request(app).get(`/v1/currency-exchange-rates/fetch-from-bcv/`)

        expect(res.status).to.equal(200);

        const rates = res.body
    
        // Fetch the latest entry from the database
        const savedRate = await CurrencyExchangeRates.findOne({ order: [['createdAt', 'DESC']] });
    
        expect(savedRate).to.not.be.null;
        expect(savedRate.dolarBCVToBs).to.equal(rates.dolarBCVToBs);
        expect(savedRate.euroBCVToBs).to.equal(rates.euroBCVToBs);
        
        // Optionally, you can also log the results to check them visually
        // console.log('Fetched Rates:', rates);
        // console.log('Saved Rates:', savedRate.toJSON());
    });
});