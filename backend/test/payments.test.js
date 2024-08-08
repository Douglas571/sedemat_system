const request = require('supertest');
const app = require('../app'); // Adjust the path to your app
const {Payment} = require('../database/models'); // Adjust the path to your payment model

describe('Payment API', () => {
    let expect;
    let paymentId;

    before(async () => {
        // Dynamically import chai
        ({ expect } = await import('chai'));
    });

    after(async () => {
        // Clean up any data created during the tests
        if (paymentId) {
            await Payment.destroy({ where: { id: paymentId } });
        }
    });

    it('should create a new payment', async () => {
        const res = await request(app)
            .post('/v1/payments')
            .send({
                dni: '12345678',
                amount: '100.00',
                account: '9876543210',
                reference: `REF${Date.now()}`,
                paymentDate: '2023-01-01',
                image: 'payment_image.png',
                state: 'pending',
                businessName: 'Test Business',
                isVerified: false,
            });

        expect(res.status).to.equal(201);
        expect(res.body).to.have.property('id');
        paymentId = res.body.id;
    });

    it('should get all payments', async () => {
        const res = await request(app).get('/v1/payments');

        expect(res.status).to.equal(200);
        expect(res.body).to.be.an('array');
    });

    it('should get a payment by id', async () => {
        const res = await request(app).get(`/v1/payments/${paymentId}`);

        expect(res.status).to.equal(200);
        expect(res.body).to.have.property('id', paymentId);
    });

    it('should update a payment', async () => {
        const res = await request(app)
            .put(`/v1/payments/${paymentId}`)
            .send({
                dni: '87654321',
                amount: '150.00',
                account: '0123456789',
                reference: `REF${Date.now()}`,
                paymentDate: '2023-02-01',
                image: 'updated_image.png',
                state: 'completed',
                businessName: 'Updated Business',
                isVerified: true,
            });

        expect(res.status).to.equal(200);
        expect(res.body).to.have.property('state', 'completed');
    });

    it('should delete a payment', async () => {
        const res = await request(app).delete(`/v1/payments/${paymentId}`);

        expect(res.status).to.equal(204);
    });
});