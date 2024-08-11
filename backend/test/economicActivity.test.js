const request = require('supertest');
const app = require('../app'); // Adjust the path to your app
const {EconomicActivity} = require('../database/models'); // Adjust the path to your model

describe('EconomicActivity API', () => {
    let expect;
    let economicActivityId;

    before(async () => {
        // Dynamically import chai
        ({ expect } = await import('chai'));
    });

    after(async () => {
        // Clean up any data created during the tests
        if (economicActivityId) {
            await EconomicActivity.destroy({ where: { id: economicActivityId } });
        }
    });

    it('should create a new economic activity', async () => {
        const res = await request(app)
            .post('/v1/economic-activities')
            .send({
                code: Number(String(Date.now()).slice(5)[1]), // to get an number that fits code
                title: `Test Activity ${Date.now()}`,
                alicuota: 10.00,
                minimumTax: 100.00,
            });

        expect(res.status).to.equal(201);
        expect(res.body).to.have.property('id');
        economicActivityId = res.body.id;
    });

    it('should get all economic activities', async () => {
        const res = await request(app).get('/v1/economic-activities');

        expect(res.status).to.equal(200);
        expect(res.body).to.be.an('array');
    });

    it('should get an economic activity by id', async () => {
        const res = await request(app).get(`/v1/economic-activities/${economicActivityId}`);

        expect(res.status).to.equal(200);
        expect(res.body).to.have.property('id', economicActivityId);
    });

    it('should update an economic activity', async () => {
        const res = await request(app)
            .put(`/v1/economic-activities/${economicActivityId}`)
            .send({
                code: 5678,
                title: 'Updated Test Activity',
                alicuota: 15.00,
                minimumTax: 150.00,
            });

        expect(res.status).to.equal(200);
        expect(res.body).to.have.property('title', 'Updated Test Activity');
    });

    it('should delete an economic activity', async () => {
        const res = await request(app).delete(`/v1/economic-activities/${economicActivityId}`);

        expect(res.status).to.equal(204);
    });
});