const request = require('supertest');
const path = require('path');
const app = require('../app'); // Your Express app

describe("POST /buildingDocs", () => {
    let createdBuildingDocId;

    before(async () => {
        ({ expect } = await import('chai'));
    });

    it("should upload 2 images and return the correct building document structure", async () => {
        const branchOfficeId = 1;
        const expirationDate = "2024-12-31";

        const firstDocImagePath = path.resolve(__dirname, 'buildings', 'building-1.jpg');
        const secondDocImagePath = path.resolve(__dirname, 'buildings', 'building-2.jpg');

        const response = await request(app)
            .post("/v1/building-docs")
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
            expect(image.url).to.match(/^\/uploads\/building\//);
        });

        createdBuildingDocId = response.body.id;
    });

    it("should get a building document by id, and contain all the doc images", async () => {
        const response = await request(app).get(`/v1/building-docs/${createdBuildingDocId}`);

        expect(response.status).to.equal(200);
        expect(response.body).to.have.property("id", createdBuildingDocId);
        expect(response.body).to.have.property("docImages");

        const docImages = response.body.docImages;
        expect(docImages).to.be.an.instanceof(Array);
        expect(docImages.length).to.equal(2);

        docImages.forEach((image, index) => {
            expect(image).to.have.property("id");
            expect(image).to.have.property("pageNumber", index + 1);
            expect(image).to.have.property("url");
            expect(image.url).to.match(/^\/uploads\/building\//);
        });
    });

    // Additional tests for update, getAll, and delete...
});