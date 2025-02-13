import { PermitDoc } from "./types";



const IP = process.env.BACKEND_IP || "localhost"
const PORT = process.env.BACKEND_PORT || "3000"
const HOST = "http://" + IP + ":" + PORT



export async function sendPermit(permitDocData: PermitDoc): Promise<PermitDoc | undefined> {
    const { expirationDate, type, docImages, branchOfficeId } = permitDocData

    console.log({permitDocData})

    const formData = new FormData()
    formData.append('branchOfficeId', branchOfficeId)
    formData.append('expirationDate', expirationDate)
    formData.append('type', type)

    // Append each document image
    docImages.forEach((file, index) => {
        formData.append('docImages', file);
    })

    try {
        const response = await fetch(`${HOST}/v1/permit-docs`, {
            method: 'POST',
            body: formData,
        });

        const data = await response.json();

        if (!response.ok) {
            let error = data.error
            throw new Error(error.message || 'Failed to upload permission');
        }
        
        console.log('Permission uploaded successfully:', data);

        return data
    } catch (error) {
        console.error('Failed to upload permission:', error);

        throw error
    }
}