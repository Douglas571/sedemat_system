const request = require('supertest');
const { expect } = require('chai');
const app = require('../app'); // Adjust the path if your app file is named differently

describe('Payments API', () => {
    describe('GET /api/payments', () => {
        it('should get all payments', (done) => {
            request(app)
                .get('/api/payments')
                .expect(200)
                .end((err, res) => {
                    if (err) return done(err);
                    expect(res.body).to.be.an('array');
                    expect(res.body.length).to.be.above(0);
                    done();
                });
        });
    });

    describe('GET /api/payments/:id', () => {
        it('should get a payment by id', (done) => {
            const paymentId = 1; // Assuming this payment ID exists in the dummy data
            request(app)
                .get(`/api/payments/${paymentId}`)
                .expect(200)
                .end((err, res) => {
                    if (err) return done(err);
                    expect(res.body).to.be.an('object');
                    expect(res.body.id).to.equal(paymentId);
                    done();
                });
        });

        it('should return 404 for a non-existent payment', (done) => {
            const paymentId = 999; // Assuming this payment ID does not exist
            request(app)
                .get(`/api/payments/${paymentId}`)
                .expect(404, done);
        });
    });

    describe('POST /api/payments', () => {
        it('should create a new payment', (done) => {
            const newPayment = {
                reference: 'REF126',
                amount: 4000,
                comment: 'Payment 4',
                image: 'image4.png',
                dni: '87651234'
            };
            request(app)
                .post('/api/payments')
                .send(newPayment)
                .expect(201)
                .end((err, res) => {
                    if (err) return done(err);
                    expect(res.body).to.be.an('object');
                    expect(res.body).to.include(newPayment);
                    done();
                });
        });
    });

    describe('PUT /api/payments/:id', () => {
        it('should update an existing payment', (done) => {
            const paymentId = 1; // Assuming this payment ID exists in the dummy data
            const updatedPayment = {
                reference: 'REF123_UPDATED',
                amount: 5000,
                comment: 'Payment 1 Updated',
                image: 'image1_updated.png',
                dni: '12345678'
            };
            request(app)
                .put(`/api/payments/${paymentId}`)
                .send(updatedPayment)
                .expect(200)
                .end((err, res) => {
                    if (err) return done(err);
                    expect(res.body).to.be.an('object');
                    expect(res.body).to.include(updatedPayment);
                    done();
                });
        });

        it('should return 404 for updating a non-existent payment', (done) => {
            const paymentId = 999; // Assuming this payment ID does not exist
            const updatedPayment = {
                reference: 'REF999',
                amount: 5000,
                comment: 'Payment 999',
                image: 'image999.png',
                dni: '99999999'
            };
            request(app)
                .put(`/api/payments/${paymentId}`)
                .send(updatedPayment)
                .expect(404, done);
        });
    });

    describe('DELETE /api/payments/:id', () => {
        it('should delete an existing payment', (done) => {
            const paymentId = 1; // Assuming this payment ID exists in the dummy data
            request(app)
                .delete(`/api/payments/${paymentId}`)
                .expect(200, done);
        });

        it('should return 404 for deleting a non-existent payment', (done) => {
            const paymentId = 999; // Assuming this payment ID does not exist
            request(app)
                .delete(`/api/payments/${paymentId}`)
                .expect(404, done);
        });
    });
});