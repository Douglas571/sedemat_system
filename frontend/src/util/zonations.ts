const IP = process.env.BACKEND_IP || "localhost";
const PORT = "3000";
const HOST = `http://${IP}:${PORT}`;

export interface ZonationUpload {
    branchOfficeId: number;
    docImages: File[];
}

export interface Zonation {
    branchOfficeId: number;
    docImages: string[]; // Assuming the API returns URLs or file names
}

export const createZonation = async (zonation: ZonationUpload): Promise<Zonation | undefined > => {
    const formData = new FormData();
    formData.append('branchOfficeId', zonation.branchOfficeId.toString());

    zonation.docImages.forEach((file, index) => {
        console.log({file, index})
        formData.append('docImages', file.originFileObj);
    });

    try {
        const response = await fetch(`${HOST}/v1/zonations`, {
            method: 'POST',
            body: formData,
            headers: {
                // 'Content-Type' is automatically set to multipart/form-data when using FormData
            },
        });

        const data = await response.json()

        if (!response.ok) {
            throw new Error(`Error creating zonation: ${response.statusText}`);
        }

        if(data) return data

        return undefined
    } catch (error) {
        console.error('Error creating zonation:', error);
    }
};

export const getZonationById = async (id: number): Promise<Zonation> => {
    try {
        const response = await fetch(`${HOST}/v1/zonations/${id}`);

        if (!response.ok) {
            throw new Error(`Error fetching zonation by ID: ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error fetching zonation by ID:', error);
        throw error;
    }
};

export const getAllZonations = async (): Promise<Zonation[]> => {
    try {
        const response = await fetch(`${HOST}/v1/zonations`);

        if (!response.ok) {
            throw new Error(`Error fetching all zonations: ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error fetching all zonations:', error);
        throw error;
    }
};

export const updateZonation = async (id: number, zonation: ZonationUpload): Promise<void> => {
    const formData = new FormData();
    formData.append('branchOfficeId', zonation.branchOfficeId.toString());

    zonation.docImages.forEach((file, index) => {
        formData.append(`docImages[${index}]`, file);
    });

    try {
        const response = await fetch(`${HOST}/v1/zonations/${id}`, {
            method: 'PUT',
            body: formData,
            headers: {
                // 'Content-Type' is automatically set to multipart/form-data when using FormData
            },
        });

        if (!response.ok) {
            throw new Error(`Error updating zonation: ${response.statusText}`);
        }
    } catch (error) {
        console.error('Error updating zonation:', error);
    }
};

export const deleteZonation = async (id: number): Promise<void> => {
    try {
        const response = await fetch(`${HOST}/v1/zonations/${id}`, {
            method: 'DELETE',
        });

        if (!response.ok) {
            throw new Error(`Error deleting zonation: ${response.statusText}`);
        }
    } catch (error) {
        console.error('Error deleting zonation:', error);
    }
};
