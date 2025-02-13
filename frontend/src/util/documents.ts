import { DocumentPayload, ExpirableDocument } from "./types";

const IP = import.meta.env.VITE_BACKEND_IP || "localhost"
const PORT = import.meta.env.VITE_BACKEND_PORT || "3000"
const HOST = "http://" + IP + ":" + PORT



// create a funtion called sendLeaseDocument to register leaseDocuments
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