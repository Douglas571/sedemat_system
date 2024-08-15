/**

I need a function to send zonations data

zonations have the following structure (create a typescript interface for it)


    branchOfficeId
    docImages: files

    I need to send a POST request to the endpoint `${HOST}/zonations`

    the data will be in a FormData format


also, give me the functions to get by id, get all, update, and delete


every function and convenient type should be exported

 */

const IP = process.env.BACKEND_IP || "localhost"
const PORT = "3000"
const HOST = "http://" + IP + ":" + PORT

export interface Zonation {
    branchOfficeId: number;
    docImages: File[];
}

import axios from 'axios';

export const createZonation = async (zonation: Zonation): Promise<void> => {
    const formData = new FormData();
    formData.append('branchOfficeId', zonation.branchOfficeId.toString());

    zonation.docImages.forEach((file, index) => {
        formData.append(`docImages[${index}]`, file);
    });

    try {
        await axios.post(`${HOST}/zonations`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    } catch (error) {
        console.error('Error creating zonation:', error);
    }
};

export const getZonationById = async (id: number): Promise<Zonation> => {
    try {
        const response = await axios.get<Zonation>(`${HOST}/zonations/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching zonation by ID:', error);
        throw error;
    }
};

export const getAllZonations = async (): Promise<Zonation[]> => {
    try {
        const response = await axios.get<Zonation[]>(`${HOST}/zonations`);
        return response.data;
    } catch (error) {
        console.error('Error fetching all zonations:', error);
        throw error;
    }
};

export const updateZonation = async (id: number, zonation: Zonation): Promise<void> => {
    const formData = new FormData();
    formData.append('branchOfficeId', zonation.branchOfficeId.toString());

    zonation.docImages.forEach((file, index) => {
        formData.append(`docImages[${index}]`, file);
    });

    try {
        await axios.put(`${HOST}/zonations/${id}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    } catch (error) {
        console.error('Error updating zonation:', error);
    }
};

export const deleteZonation = async (id: number): Promise<void> => {
    try {
        await axios.delete(`${HOST}/zonations/${id}`);
    } catch (error) {
        console.error('Error deleting zonation:', error);
    }
};