const request = require('supertest');
const app = require('../app'); // Adjust the path to your app

describe('Business API', () => {
    let expect;
    let businessId;

    before(async () => {
        // Dynamically import chai
        ({ expect } = await import('chai'));
    });

    it('should create a new business', async () => {
        const res = await request(app)
            .post('/v1/businesses')
            .send({
                businessName: `Test Business ${Date.now()}`,
                dni: '12345678',
                email: 'test@business.com',
                establishmentDate: '2020-01-01',
                expirationDate: '2030-01-01',
                board_expirationDate: '2025-01-01',
            });

        expect(res.status).to.equal(201);
        expect(res.body).to.have.property('id');
        businessId = res.body.id;
    });

    it('should get all businesses', async () => {
        const res = await request(app).get('/v1/businesses');

        expect(res.status).to.equal(200);
        expect(res.body).to.be.an('array');
    });

    it('should get a business by id', async () => {
        const res = await request(app).get(`/v1/businesses/${businessId}`);

        expect(res.status).to.equal(200);
        expect(res.body).to.have.property('id', businessId);
    });

    it('should update a business', async () => {
        const res = await request(app)
            .put(`/v1/businesses/${businessId}`)
            .send({
                businessName: 'Updated Business',
                dni: '87654321',
                email: 'updated@business.com',
                establishmentDate: '2021-01-01',
                expirationDate: '2031-01-01',
                boardExpirationDate: '2026-01-01',
            });

        expect(res.status).to.equal(200);
        expect(res.body).to.have.property('businessName', 'Updated Business');
    });

    it('should delete a business', async () => {
        const res = await request(app).delete(`/v1/businesses/${businessId}`);

        expect(res.status).to.equal(200);
    });
});