const request = require('supertest');
const app = require('../app'); // Adjust the path to your app
const {EconomicActivity, EconomicLicense, BranchOffice} = require('../database/models');

describe('EconomicLicense API', () => {
    let expect;
    let economicLicenseId;
    let branchOfficeId;
    let economicActivityId;

    before(async () => {
        // Dynamically import chai
        ({ expect } = await import('chai'));

        // Create a new branch office
        const branchOfficeRes = await request(app)
            .post('/v1/branch-offices')
            .send({
                address: '123 Main St',
                phone: '123-456-7890',
                businessId: 1, // Assuming a business with ID 1 exists in the database
                origin: 'Alquilado',
                zone: 'Centro',
                dimensions: 49,
                type: "I"
            });
            
        branchOfficeId = branchOfficeRes.body.id;

        // Create a new economic activity
        const economicActivityRes = await request(app)
            .post('/v1/economic-activities')
            .send({
                code: Number(String(Date.now()).slice(5)[1]),
                title: `Test Activity ${Date.now()}`,
                alicuota: 10.00,
                minimumTax: 100.00,
            });

        economicActivityId = economicActivityRes.body.id;
    });

    after(async () => {
        // Clean up any data created during the tests
        if (economicLicenseId) {
            await EconomicLicense.destroy({ where: { id: economicLicenseId } });
        }

        if (branchOfficeId) {
            await BranchOffice.destroy({ where: { id: branchOfficeId } });
        }

        if (economicActivityId) {
            await EconomicActivity.destroy({ where: { id: economicActivityId } });
        }
    });

    it('should create a new economic license', async () => {
        const res = await request(app)
            .post('/v1/economic-licenses')
            .send({
                branchOfficeId: branchOfficeId,
                economicActivityId: economicActivityId,
                openAt: '08:00:00',
                closeAt: '18:00:00',
                issuedDate: '2023-01-01',
                expirationDate: '2024-01-01',
            });

        expect(res.status).to.equal(201);
        expect(res.body).to.have.property('id');
        economicLicenseId = res.body.id;
    });

    it('should get all economic licenses', async () => {
        const res = await request(app).get('/v1/economic-licenses');

        expect(res.status).to.equal(200);
        expect(res.body).to.be.an('array');
    });

    it('should get an economic license by id', async () => {
        const res = await request(app).get(`/v1/economic-licenses/${economicLicenseId}`);

        expect(res.status).to.equal(200);
        expect(res.body).to.have.property('id', economicLicenseId);
    });

    it('should update an economic license', async () => {
        const res = await request(app)
            .put(`/v1/economic-licenses/${economicLicenseId}`)
            .send({
                branchOfficeId: branchOfficeId,
                economicActivityId: economicActivityId,
                openAt: '09:00:00',
                closeAt: '17:00:00',
                issuedDate: '2023-01-02',
                expirationDate: '2024-01-02',
            });

        expect(res.status).to.equal(200);
        expect(res.body).to.have.property('openAt', '09:00:00');
    });

    it('should delete an economic license', async () => {
        const res = await request(app).delete(`/v1/economic-licenses/${economicLicenseId}`);

        expect(res.status).to.equal(204);
    });
});