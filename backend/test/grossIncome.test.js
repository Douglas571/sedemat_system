const request = require('supertest');
const app = require('../app'); // Adjust the path to your app
const { GrossIncome, Business, BranchOffice } = require('../database/models');

describe('GrossIncome API', () => {
    let expect;
    let grossIncomeId;
    let businessId;
    let branchOfficeId;

    before(async () => {
        // Dynamically import chai
        ({ expect } = await import('chai'));

        // Create a new business
        const businessRes = await request(app)
            .post('/v1/businesses')
            .send({
                name: 'Test Business',
                taxId: '123456789',
                economicActivityId: 1,
            });

        businessId = businessRes.body.id;

        // Create a new branch office
        const branchOfficeRes = await request(app)
            .post('/v1/branch-offices')
            .send({
                businessId: businessId,
                nickname: 'Main Office',
                address: '123 Main St',
            });

        branchOfficeId = branchOfficeRes.body.id;
    });

    after(async () => {
        // Clean up any data created during the tests
        if (grossIncomeId) {
            await GrossIncome.destroy({ where: { id: grossIncomeId } });
        }

        if (branchOfficeId) {
            await BranchOffice.destroy({ where: { id: branchOfficeId } });
        }

        if (businessId) {
            await Business.destroy({ where: { id: businessId } });
        }
    });

    it('should create a new gross income record', async () => {
        const res = await request(app)
            .post('/v1/gross-incomes')
            .send({
                businessId: businessId,
                branchOfficeId: branchOfficeId,
                period: '2024-09-01',
                amountBs: 5000.00,
                chargeWasteCollection: true,
                declarationImage: 'image1.png',
            });

        expect(res.status).to.equal(201);
        expect(res.body).to.have.property('id');
        grossIncomeId = res.body.id;
    });

    it('should get all gross income records', async () => {
        const res = await request(app).get('/v1/gross-incomes');

        expect(res.status).to.equal(200);
        expect(res.body).to.be.an('array');
    });

    it('should get a gross income record by id', async () => {
        const res = await request(app).get(`/v1/gross-incomes/${grossIncomeId}`);

        expect(res.status).to.equal(200);
        expect(res.body).to.have.property('id', grossIncomeId);
    });

    it('should update a gross income record', async () => {
        const res = await request(app)
            .put(`/v1/gross-incomes/${grossIncomeId}`)
            .send({
                amountBs: 6000,
                chargeWasteCollection: false,
                declarationImage: 'image_updated.png',
            });

        expect(res.status).to.equal(200);
        expect(res.body).to.have.property('amountBs', 6000);
        expect(res.body).to.have.property('chargeWasteCollection', false);
        expect(res.body).to.have.property('declarationImage', 'image_updated.png');
    });

    it('should delete a gross income record', async () => {
        const res = await request(app).delete(`/v1/gross-incomes/${grossIncomeId}`);

        expect(res.status).to.equal(204);
    });
});