const request = require('supertest');
const app = require('../app'); // Adjust the path to your app
const BranchOffice = require('../models/branchOffice'); // Adjust the path to your model
const Business = require('../models/business'); // Adjust the path to your business model

describe('BranchOffice API', () => {
    let expect;
    let branchOfficeId;
    let businessId;

    before(async () => {
        // Dynamically import chai
        ({ expect } = await import('chai'));

        // Create a new business
        const businessRes = await request(app)
            .post('/v1/businesses')
            .send({
                businessName: `Test Business ${Date.now()}`,
                dni: '12345678',
                email: 'test@business.com',
                companyIncorporationDate: '2020-01-01',
                companyExpirationDate: '2030-01-01',
                directorsBoardExpirationDate: '2025-01-01',
                economicActivityId: 1
            });

        businessId = businessRes.body.id;
    });

    after(async () => {
        // Clean up any data created during the tests
        if (branchOfficeId) {
            await BranchOffice.destroy({ where: { id: branchOfficeId } });
        }

        if (businessId) {
            await Business.destroy({ where: { id: businessId } });
        }
    });

    it('should create a new branch office', async () => {
        const res = await request(app)
            .post('/v1/branch-offices')
            .send({
                address: '123 Main St',
                phone: '123-456-7890',
                businessId: businessId,
                origin: 'Alquilado',
                zone: 'Centro',
                dimensions: 49,
                type: "I"
            });

        expect(res.status).to.equal(201);
        expect(res.body).to.have.property('id');
        branchOfficeId = res.body.id;

    });

    it('should get all branch offices', async () => {
        const res = await request(app).get('/v1/branch-offices');

        expect(res.status).to.equal(200);
        expect(res.body).to.be.an('array');
    });

    it('should get a branch office by id', async () => {
        const res = await request(app).get(`/v1/branch-offices/${branchOfficeId}`);

        expect(res.status).to.equal(200);
        expect(res.body).to.have.property('id', branchOfficeId);
    });

    it('should update a branch office', async () => {
        const res = await request(app)
            .put(`/v1/branch-offices/${branchOfficeId}`)
            .send({
                address: '456 Another St',
                phone: '987-654-3210',
                businessId: businessId,
                origin: 'Propio',
                zone: 'Centro',
                dimensions: 100,
                type: "II"
            });

        expect(res.status).to.equal(200);
        expect(res.body).to.have.property('address', '456 Another St');
    });

    it('should delete a branch office', async () => {
        const res = await request(app).delete(`/v1/branch-offices/${branchOfficeId}`);

        expect(res.status).to.equal(204);
    });
});