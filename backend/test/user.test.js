const request = require('supertest');
const app = require('../app'); // Adjust the path to your app
const { User, Role, Person } = require('../database/models');

describe('User API', () => {
    let expect;
    let userId;
    let roleId;
    let personId;

    before(async () => {
        // Dynamically import chai
        ({ expect } = await import('chai'));

        // Create a new role
        const roleRes = await request(app)
            .post('/v1/roles')
            .send({
                name: 'Test Role',
                description: 'A role for testing purposes',
            });

        roleId = roleRes.body.id;

        // Create a new person
        const personRes = await request(app)
            .post('/v1/people')
            .send({
                firstName: 'John',
                lastName: 'Doe',
                dni: '12345678',
            });

        personId = personRes.body.id;
    });

    after(async () => {
        // Clean up any data created during the tests
        if (userId) {
            await User.destroy({ where: { id: userId } });
        }

        if (roleId) {
            await Role.destroy({ where: { id: roleId } });
        }

        if (personId) {
            await Person.destroy({ where: { id: personId } });
        }
    });

    it('should create a new user', async () => {
        const res = await request(app)
            .post('/v1/users')
            .send({
                email: 'john.doe@example.com',
                password: 'password123',
                roleId: roleId,
                personId: personId,
            });

        expect(res.status).to.equal(201);
        expect(res.body).to.have.property('id');
        userId = res.body.id;
    });

    it('should get all users', async () => {
        const res = await request(app).get('/v1/users');

        expect(res.status).to.equal(200);
        expect(res.body).to.be.an('array');
    });

    it('should get a user by id', async () => {
        const res = await request(app).get(`/v1/users/${userId}`);

        expect(res.status).to.equal(200);
        expect(res.body).to.have.property('id', userId);
    });

    it('should update a user', async () => {
        const res = await request(app)
            .put(`/v1/users/${userId}`)
            .send({
                email: 'john.updated@example.com',
                password: 'newpassword123',
                roleId: roleId,
                personId: personId,
            });

        expect(res.status).to.equal(200);
        expect(res.body).to.have.property('email', 'john.updated@example.com');
    });

    it('should delete a user', async () => {
        const res = await request(app).delete(`/v1/users/${userId}`);

        expect(res.status).to.equal(204);
    });
});