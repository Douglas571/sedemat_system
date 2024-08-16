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

describe("POST /zonations", () => {

    before(async () => {
        // Dynamically import chai
        ({ expect } = await import('chai'));
    });

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

        // console.log("after sending request")
        // Assertions
        expect(response.status).to.equal(201);
        // expect(response.body).to.have.property("zonation");
        expect(response.body).to.have.property("id");
        expect(response.body).to.have.property(
            "branchOfficeId",
            String(branchOfficeId)
        );
        // console.log({body: JSON.stringify(response.body, null, 2)})
        expect(response.body).to.have.property("docImages");

        // Check docImages array
        const docImages = response.body.docImages;
        expect(docImages).to.be.an.instanceof(Array);
        expect(docImages.length).to.equal(2);

        // Validate each image object
        docImages.forEach((image, index) => {
            expect(image).to.have.property("id");
            expect(image).to.have.property("pageNumber", index + 1); // Assuming `page` starts at 1 for the first image
            expect(image).to.have.property("url");
            expect(image.url).to.match(/^\/uploads\/zonations\//); // Ensure URL starts with "/uploads/zoning/"
        });
    });
});
