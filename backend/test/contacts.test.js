const request = require('supertest');
const app = require('../app'); // Adjust the path to your app
const Contact = require('../models/contact'); // Adjust the path to your model

describe('Contact API', () => {
    let expect;
    let contactId;

    before(async () => {
        // Dynamically import chai
        ({ expect } = await import('chai'));
    });

    after(async () => {
        // Clean up any data created during the tests
        if (contactId) {
            await Contact.destroy({ where: { id: contactId } });
        }
    });

    it('should create a new contact', async () => {
        const res = await request(app)
            .post('/v1/contacts')
            .send({
                dni: Date.now(), // Using timestamp as unique DNI for test
                firstName: 'John',
                lastName: 'Doe',
                phone: '123-456-7890',
                whatsapp: '123-456-7890',
                email: 'john.doe@example.com',
            });

        expect(res.status).to.equal(201);
        expect(res.body).to.have.property('id');
        contactId = res.body.id;
    });

    it('should get all contacts', async () => {
        const res = await request(app).get('/v1/contacts');

        expect(res.status).to.equal(200);
        expect(res.body).to.be.an('array');
    });

    it('should get a contact by id', async () => {
        const res = await request(app).get(`/v1/contacts/${contactId}`);

        expect(res.status).to.equal(200);
        expect(res.body).to.have.property('id', contactId);
    });

    it('should update a contact', async () => {
        const res = await request(app)
            .put(`/v1/contacts/${contactId}`)
            .send({
                firstName: 'Jane',
                lastName: 'Doe',
                phone: '987-654-3210',
                whatsapp: '987-654-3210',
                email: 'jane.doe@example.com',
            });

        expect(res.status).to.equal(200);
        expect(res.body).to.have.property('firstName', 'Jane');
    });

    it('should delete a contact', async () => {
        const res = await request(app).delete(`/v1/contacts/${contactId}`);

        expect(res.status).to.equal(204);
    });
});
