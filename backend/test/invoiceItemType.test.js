const request = require('supertest');
const app = require('../app'); // Adjust the path to your app
const { InvoiceItemType } = require('../database/models');


describe('InvoiceItemType API', () => {
    let invoiceItemTypeId;

    // Clean up before tests
    before(async () => {
        // Dynamically import chai
        ({ expect } = await import('chai'));

        // Clean any previous data
        await InvoiceItemType.destroy({ where: {} });
    });

    // Clean up after tests
    after(async () => {
        if (invoiceItemTypeId) {
            await InvoiceItemType.destroy({ where: { id: invoiceItemTypeId } });
        }
    });

    // Test to create a new invoice item type
    it('should create a new invoice item type', async () => {
        const res = await request(app)
            .post('/v1/invoice-item-types')
            .send({
                code: 'TYPE001',
                name: 'Test Item Type',
                defaultAmountMMV: 500.0
            });

        expect(res.status).to.equal(201);
        expect(res.body).to.have.property('id');
        expect(res.body).to.have.property('code', 'TYPE001');
        expect(res.body).to.have.property('name', 'Test Item Type');
        expect(res.body).to.have.property('defaultAmountMMV', 500.0);

        invoiceItemTypeId = res.body.id;
    });

    // Test to get all invoice item types
    it('should get all invoice item types', async () => {
        const res = await request(app).get('/v1/invoice-item-types');

        expect(res.status).to.equal(200);
        expect(res.body).to.be.an('array');
        expect(res.body.length).to.be.greaterThan(0);
    });

    // Test to get an invoice item type by id
    it('should get an invoice item type by id', async () => {
        const res = await request(app).get(`/v1/invoice-item-types/${invoiceItemTypeId}`);

        expect(res.status).to.equal(200);
        expect(res.body).to.have.property('id', invoiceItemTypeId);
        expect(res.body).to.have.property('code', 'TYPE001');
        expect(res.body).to.have.property('name', 'Test Item Type');
        expect(res.body).to.have.property('defaultAmountMMV', 500.0);
    });

    // Test to update an invoice item type
    it('should update an invoice item type', async () => {
        const res = await request(app)
            .put(`/v1/invoice-item-types/${invoiceItemTypeId}`)
            .send({
                name: 'Updated Item Type',
                defaultAmountMMV: 600.0
            });

        expect(res.status).to.equal(200);
        expect(res.body).to.have.property('name', 'Updated Item Type');
        expect(res.body).to.have.property('defaultAmountMMV', 600.0);
    });

    // Test to delete an invoice item type
    it('should delete an invoice item type', async () => {
        const res = await request(app).delete(`/v1/invoice-item-types/${invoiceItemTypeId}`);

        expect(res.status).to.equal(204);
    });
});
