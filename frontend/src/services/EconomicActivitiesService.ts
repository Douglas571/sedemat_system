import { EconomicActivity } from '../util/types';

class EconomicActivitiesService {
    private readonly endpoint: string;

    constructor(baseUrl: string, apiEndpoint: string) {
        this.endpoint = `${baseUrl}${apiEndpoint}`;
    }

    async findById(id: number): Promise<EconomicActivity> {
        const response = await fetch(`${this.endpoint}/${id}`);
        return await response.json();
    }

    async findAll(): Promise<EconomicActivity[]> {
        const response = await fetch(this.endpoint);
        return await response.json();
    }

    async update(id: number, economicActivity: EconomicActivity): Promise<EconomicActivity> {
        const response = await fetch(`${this.endpoint}/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(economicActivity)
        });
        return await response.json();
    }

    async delete(id: number): Promise<void> {
        await fetch(`${this.endpoint}/${id}`, {
            method: 'DELETE'
        });
    }
}

export const economicActivitiesService = new EconomicActivitiesService('http://localhost:3000', '/economic-activities');
