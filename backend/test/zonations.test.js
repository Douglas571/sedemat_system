// 1th tests

// check that i can upload 2 images to the endpoint with a
// business id in multipart form data, and return status code 200, with an object of the following form
/**
 * zonation
 *      id
 *      branchOfficeId
 *      docImages
 *          id
 *          page
 *          url
 *
 */
// the zonation branchOfficeId, should be equal to the branch office id passed
// the url should not have host, the first part should be "/uploads/zoning/"

const request = require("supertest");
const app = require("../app"); // Your Express app
const path = require("path")

describe("Zonations API", () => {
    let createdZonationId;

    before(async () => {
        // Dynamically import chai
        ({ expect } = await import('chai'));
    });

    describe("POST /v1/zonations", () => {
        it("should upload 2 images and return the correct zonation structure", async () => {
            const branchOfficeId = 1; // Example branch office ID

            const firstDocImagePath = path.resolve(__dirname, 'zonations', 'zonation-1.jpeg');
            const secondDocImagePath = path.resolve(__dirname, 'zonations', 'zonation-2.jpeg');

            const response = await request(app)
                .post("/v1/zonations")
                .set("Content-Type", "multipart/form-data")
                .field("branchOfficeId", branchOfficeId)
                .attach("docImages", firstDocImagePath) // First image file path
                .attach("docImages", secondDocImagePath); // Second image file path

            expect(response.status).to.equal(201);
            expect(response.body).to.have.property("id");
            expect(response.body).to.have.property("branchOfficeId", String(branchOfficeId));
            expect(response.body).to.have.property("docImages");

            const docImages = response.body.docImages;
            expect(docImages).to.be.an.instanceof(Array);
            expect(docImages.length).to.equal(2);

            docImages.forEach((image, index) => {
                expect(image).to.have.property("id");
                expect(image).to.have.property("pageNumber", index + 1); // Assuming `page` starts at 1 for the first image
                expect(image).to.have.property("url");
                expect(image.url).to.match(/^\/uploads\/zonations\//); // Ensure URL starts with "/uploads/zonations/"
            });

            createdZonationId = response.body.id;
        });
    });

    describe("GET /v1/zonations/:id", () => {
        it("should fetch a zonation by id and contain all the doc images", async () => {
            const response = await request(app).get(`/v1/zonations/${createdZonationId}`);

            expect(response.status).to.equal(200);
            expect(response.body).to.have.property("id", createdZonationId);
            expect(response.body).to.have.property("branchOfficeId");
            expect(response.body).to.have.property("docImages");

            const docImages = response.body.docImages;
            expect(docImages).to.be.an.instanceof(Array);
            expect(docImages.length).to.equal(2);

            docImages.forEach((image, index) => {
                expect(image).to.have.property("id");
                expect(image).to.have.property("pageNumber", index + 1);
                expect(image).to.have.property("url");
                expect(image.url).to.match(/^\/uploads\/zonations\//);
            });
        });
    });


    
    describe("GET /v1/zonations", () => {
        it("should fetch all zonations and contain expected structure", async () => {
            const response = await request(app).get("/v1/zonations");

            expect(response.status).to.equal(200);
            expect(response.body).to.be.an.instanceof(Array);

            // console.log(JSON.stringify(response.body, null, 2))

            // response.body.forEach((zonation) => {
            //     expect(zonation).to.have.property("id");
            //     expect(zonation).to.have.property("branchOfficeId");
            //     expect(zonation).to.have.property("docImages");
            //     expect(zonation.docImages).to.be.an.instanceof(Array);
            // });
        });
    });

    
    describe("PUT /v1/zonations/:id", () => {
        it("should update the zonation data", async () => {
            const updatedBranchOfficeId = 2; // New branch office ID for testing

            const response = await request(app)
                .put(`/v1/zonations/${createdZonationId}`)
                .send({
                    branchOfficeId: updatedBranchOfficeId,
                });

            expect(response.status).to.equal(200);
            expect(response.body).to.have.property("id", Number(createdZonationId));
            expect(response.body).to.have.property("branchOfficeId", updatedBranchOfficeId);
        });
    });

    describe("DELETE /v1/zonations/:id", () => {
        it("should delete the zonation by id", async () => {
            const response = await request(app).delete(`/v1/zonations/${createdZonationId}`);

            expect(response.status).to.equal(204); // No content for successful deletion

            // Verify deletion by attempting to get the deleted zonation
            const verifyDeletionResponse = await request(app).get(`/v1/zonations/${createdZonationId}`);
            expect(verifyDeletionResponse.status).to.equal(404); // Not found after deletion
        });
    });

    // TODO: Add test case for when zonation doc image is empty 
});



// TODO: Implement edit endpoint to upload new images to zonification 
// TODO: Modify the api, so you can choice if populating docImages


/**
 * it would be better if i clean 
 * all images associated with one document, and replace them with new ones
 * just for now, later i can improve it 
 * 
 */