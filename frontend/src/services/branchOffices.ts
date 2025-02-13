import axios from 'axios';
import { BranchOffice } from './../util/types'; // Adjust the import path as needed

const IP = import.meta.env.VITE_BACKEND_IP || 'localhost';
const PORT = import.meta.env.VITE_BACKEND_PORT || "3000"
const HOST = 'http://' + IP + ':' + PORT;

console.log({ HOST, PORT, IP });

/**
 * Fetches branch offices for a given business ID.
 * @param businessId - The ID of the business to fetch branch offices for.
 * @returns A promise that resolves to an array of BranchOffice objects.
 * @throws An error if the request fails.
 */
export async function getBranchOffices({
  filters,
  token
}: {
  filters: {
    businessId: number
  },
  token: string
}): Promise<BranchOffice[]> {

    const { businessId } = filters
    try {
        const response = await axios.get<BranchOffice[]>(`${HOST}/v1/branch-offices`, {
            params: {
                businessid: businessId,
            },
            headers: {
                'Content-Type': 'application/json',
            },
        });

        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            // Handle Axios-specific errors
            const errorMessage = error.response?.data?.error?.msg || error.message;
            throw new Error(`Error al buscar sedes: ${errorMessage}`);
        } else {
            // Handle generic errors
            throw new Error(`Error al buscar sedes: ${error}`);
        }
    }
}