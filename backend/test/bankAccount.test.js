const request = require('supertest');
const app = require('../app'); // Adjust the path to your app

describe('Bank Account API', () => {
    let expect;
    let bankAccountId;

    before(async () => {
        // Dynamically import chai
        ({ expect } = await import('chai'));
    });

    // Test for creating a new bank account
    it('should create a new bank account', async () => {
        const res = await request(app)
            .post('/v1/bank-accounts')
            .send({
                name: `Test Bank ${Date.now()}`,
                accountNumber: '1234567890',
            });

        expect(res.status).to.equal(201);
        expect(res.body).to.have.property('id');
        bankAccountId = res.body.id;
    });

    // Test for fetching all bank accounts
    it('should get all bank accounts', async () => {
        const res = await request(app).get('/v1/bank-accounts');

        expect(res.status).to.equal(200);
        expect(res.body).to.be.an('array');
    });

    // Test for fetching a bank account by ID
    it('should get a bank account by id', async () => {
        const res = await request(app).get(`/v1/bank-accounts/${bankAccountId}`);

        expect(res.status).to.equal(200);
        expect(res.body).to.have.property('id', bankAccountId);
    });

    // Test for updating a bank account
    it('should update a bank account', async () => {
        const res = await request(app)
            .put(`/v1/bank-accounts/${bankAccountId}`)
            .send({
                name: 'Updated Bank',
                accountNumber: '0987654321',
            });

        expect(res.status).to.equal(200);
        expect(res.body).to.have.property('name', 'Updated Bank');
    });

    // Test for deleting a bank account
    it('should delete a bank account', async () => {
        const res = await request(app).delete(`/v1/bank-accounts/${bankAccountId}`);

        expect(res.status).to.equal(204);
    });
});