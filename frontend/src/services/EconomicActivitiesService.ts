import { EconomicActivity } from '../util/types';

const IP = process.env.BACKEND_IP ?? "localhost"
const PORT = process.env.BACKEND_PORT || "3000"
const HOST = "http://" + IP + ":" + PORT

class EconomicActivitiesService {
    private readonly endpoint: string;

    constructor(baseUrl: string, apiEndpoint: string) {
        this.endpoint = `${baseUrl}${apiEndpoint}`;
    }

    async findById(id: number, token: string = ''): Promise<EconomicActivity> {
        const response = await fetch(`${this.endpoint}/${id}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return await response.json();
    }

    async findAll(token: string = ''): Promise<EconomicActivity[]> {
        const response = await fetch(this.endpoint, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return await response.json();
    }

    
    async create(economicActivity: EconomicActivity, token: string = ''): Promise<EconomicActivity> {
        const response = await fetch(this.endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(economicActivity)
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

    async update(id: number, economicActivity: EconomicActivity, token: string = ''): Promise<EconomicActivity> {
        const response = await fetch(`${this.endpoint}/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(economicActivity)
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

        console.log(response.status)
        const data = await response.json();

        if (!response.ok) {
            const error = data.error;

            if (error.code === 'CurrentlyInUse') {
                throw new Error(`Ésta actividad económica se encuentra en uso`);
            }
            throw new Error(`Failed to delete economic activity: ${error.message}`);
        }
    }
}
export default new EconomicActivitiesService(HOST, '/v1/economic-activities');
