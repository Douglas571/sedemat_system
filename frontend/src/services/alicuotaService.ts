import { IAlicuota } from '../util/types';

const IP = import.meta.env.VITE_BACKEND_IP ?? "localhost"
const PORT = import.meta.env.VITE_BACKEND_PORT || "3000"
const HOST = "http://" + IP + ":" + PORT

interface IAlicuotaServiceFilters {
    economicActivityId?: number
}    


class AlicuotaService {
    private readonly endpoint: string;

    constructor(baseUrl: string, apiEndpoint: string) {
        this.endpoint = `${baseUrl}${apiEndpoint}`;
    }

    async findById(id: number, token: string = ''): Promise<IAlicuota> {
        const response = await fetch(`${this.endpoint}/${id}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return await response.json();
    }

    async findAll(filters: IAlicuotaServiceFilters, token: string = ''): Promise<IAlicuota[]> {
        let urlWithSearchParams = new URL(this.endpoint);

        for (const [key, value] of Object.entries(filters)) {
            if (value) {
                urlWithSearchParams.searchParams.append(key, value.toString());
            }
        }

        const response = await fetch(urlWithSearchParams.toString(), {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        return await response.json();
    }

    
    async create(alicuota: IAlicuota, token: string = ''): Promise<IAlicuota> {
        const response = await fetch(this.endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(alicuota)
        });

        const data = await response.json();

        if (!response.ok) {

            throw new Error(`${data.error.message}`);
        }

        return data;
    }

    async update(id: number, alicuota: IAlicuota, token: string = ''): Promise<IAlicuota> {
        const response = await fetch(`${this.endpoint}/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(alicuota)
        });
        
        const data = await response.json();

        if (!response.ok) {
            if (data.error.code === 'DuplicatedCode') {
                throw new Error(`El código ingresado ya existe`);
            }

            throw new Error(`${data.error.message}`);
        }

        return data;
    }

    async delete(id: number, token: string = ''): Promise<void> {
        const response = await fetch(`${this.endpoint}/${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (!response.ok) {
            if (data?.error?.code === 'TheOnlyOne') {
                throw new Error("No se puede eliminar la única alicuota");
            }

            if (data.error) {
                throw new Error(`${data.error.message}`);
            }

            throw new Error('Failed to delete alicuota history');
        }

        return data;
    }
}
export default new AlicuotaService(HOST, '/v1/alicuota-history');
