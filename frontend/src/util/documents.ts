const IP = process.env.BACKEND_IP || "localhost"
const PORT = "3000"
const HOST = "http://" + IP + ":" + PORT

interface DocumentPayload {
    branchOfficeId: number;
    expirationDate: Date;
    docImages: File[];
}

// create a funtion called sendLeaseDocument to register leaseDocuments

interface DocImages {
    id: number
    url: string
    pageNumber: number

}

interface ExpirableDocument {
    id: number
    branchOfficeId: number
    expirationDate: Date
    docImages: Array<DocImages>

}

export async function sendLeaseDocument(payload: DocumentPayload): Promise<ExpirableDocument> {
    const formData = new FormData();
    formData.append("branchOfficeId", payload.branchOfficeId.toString());
    formData.append("expirationDate", payload.expirationDate.toString());

    payload.docImages.forEach((file) => {
        formData.append("docImages", file.originFileObj);
    });

    const response = await fetch(`${HOST}/v1/lease-docs`, {
        method: "POST",
        body: formData,
    });

    if (!response.ok) {
        throw new Error("Failed to send lease document");
    }

    const data = await response.json();
    const leaseDoc = data;

    return leaseDoc;
}

// cerate a function called sendBuildingDocument to register buildingDocuments

export async function sendBuildingDocument(payload: DocumentPayload): Promise<ExpirableDocument> {
    const formData = new FormData();
    formData.append("branchOfficeId", payload.branchOfficeId.toString());
    formData.append("expirationDate", payload.expirationDate.toString());

    payload.docImages.forEach((file) => {
        formData.append("docImages", file.originFileObj);
    });

    const response = await fetch(`${HOST}/v1/building-docs`, {
        method: "POST",
        body: formData,
    });

    
    if (!response.ok) {
        throw new Error("Failed to send building document");
    }

    const data = await response.json();
    const buildingDoc = data;

    return buildingDoc;
}