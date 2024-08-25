import { CertificateOfIncorporation } from "./types";

const IP = process.env.BACKEND_IP || "localhost"
const PORT = "3000"
const HOST = "http://" + IP + ":" + PORT

export async function uploadCertificateOfIncorporation(coi: CertificateOfIncorporation) {
    const formData = new FormData();
    formData.append('businessId', coi.businessId.toString()); // Add other form fields as needed
    formData.append('expirationDate', coi.expirationDate); // Add the expiration date

    // Add multiple images (docImages)
    if (coi.docImages.length > 0) {
        coi.docImages.forEach((file) => {
            formData.append('docImages', file);
        });
    }

    try {
        const response = await fetch(`${HOST}/v1/businesses/coi`, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            throw new Error('Failed to upload certificate of incorporation');
        }

        const data = await response.json();
        console.log('Uploaded certificate of incorporation:', data);
    } catch (error) {
        console.error('Error uploading files:', error);
    }
}