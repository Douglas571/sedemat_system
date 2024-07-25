const request = require('supertest');
const app = require('../app'); // Adjust the path to your app
const Person = require('../models/person'); // Adjust the path to your model

describe('Person API', () => {
    let expect;
    let personId;

    before(async () => {
        // Dynamically import chai
        ({ expect } = await import('chai'));
    });

    after(async () => {
        // Clean up any data created during the tests
        if (personId) {
            await Person.destroy({ where: { id: personId } });
        }
    });

    it('should create a new person', async () => {
        const res = await request(app)
            .post('/v1/people')
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
        personId = res.body.id;
    });

    it('should get all persons', async () => {
        const res = await request(app).get('/v1/people');

        expect(res.status).to.equal(200);
        expect(res.body).to.be.an('array');
    });

    it('should get a person by id', async () => {
        const res = await request(app).get(`/v1/people/${personId}`);

        expect(res.status).to.equal(200);
        expect(res.body).to.have.property('id', personId);
    });

    it('should update a person', async () => {
        const res = await request(app)
            .put(`/v1/people/${personId}`)
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

    it('should delete a person', async () => {
        const res = await request(app).delete(`/v1/people/${personId}`);

        expect(res.status).to.equal(204);
    });
});