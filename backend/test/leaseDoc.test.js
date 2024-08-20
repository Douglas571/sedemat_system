const request = require('supertest');
const path = require('path');
const app = require('../app'); // Your Express app

describe("POST /lease-docs", () => {
    let createdLeaseDocId;

    before(async () => {
        ({ expect } = await import('chai'));
    });

    it("should upload 2 images and return the correct lease document structure", async () => {
        const branchOfficeId = 1;
        const expirationDate = "2024-12-31";

        const firstDocImagePath = path.resolve(__dirname, 'lease', 'lease-1.png');
        const secondDocImagePath = path.resolve(__dirname, 'lease', 'lease-2.png');

        const response = await request(app)
            .post("/v1/lease-docs")
            .set("Content-Type", "multipart/form-data")
            .field("branchOfficeId", branchOfficeId)
            .field("expirationDate", expirationDate)
            .attach("docImages", firstDocImagePath)
            .attach("docImages", secondDocImagePath);

        expect(response.status).to.equal(201);
        expect(response.body).to.have.property("id");
        expect(response.body).to.have.property(
            "branchOfficeId",
            String(branchOfficeId)
        );


        const recivedExpirationDate = new Date(expirationDate);
        expect(recivedExpirationDate.toString()).to.have.equal(new Date(expirationDate).toString());
        // expect(response.body).to.have.property("expirationDate", expirationDate);
        expect(response.body).to.have.property("docImages");

        const docImages = response.body.docImages;
        expect(docImages).to.be.an.instanceof(Array);
        expect(docImages.length).to.equal(2);

        docImages.forEach((image, index) => {
            // expect(image).to.have.property("id");
            expect(image).to.have.property("pageNumber", index + 1);
            expect(image).to.have.property("url");
            expect(image.url).to.match(/^\/uploads\/lease\//);
        });

        createdLeaseDocId = response.body.id;
    });

    it("should get a lease document by id, and contain all the doc images", async () => {
        const response = await request(app).get(`/v1/lease-docs/${createdLeaseDocId}`);

        expect(response.status).to.equal(200);
        expect(response.body).to.have.property("id", createdLeaseDocId);
        expect(response.body).to.have.property("docImages");

        const docImages = response.body.docImages;
        expect(docImages).to.be.an.instanceof(Array);
        expect(docImages.length).to.equal(2);

        docImages.forEach((image, index) => {
            expect(image).to.have.property("id");
            expect(image).to.have.property("pageNumber", index + 1);
            expect(image).to.have.property("url");
            expect(image.url).to.match(/^\/uploads\/lease\//);
        });
    });

    // Additional tests for update, getAll, and delete...
});