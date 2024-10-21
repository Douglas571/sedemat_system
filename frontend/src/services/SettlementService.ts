import dayjs from "dayjs";

import { ISettlement } from "../util/types";

const IP = process.env.BACKEND_IP || "localhost";
const PORT = "3000";
const HOST = "http://" + IP + ":" + PORT;

class SettlementService {
    private host: string;
    private baseUrl: string;

    constructor(host: string = HOST) {
        this.host = host;
        this.baseUrl = host + '/v1/settlements';
    }

    // Get all settlements
    async findAll(token: string = ''): Promise<ISettlement[]> {
        const response = await fetch(`${this.baseUrl}/`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error('Failed to fetch settlements');
        }
        return await response.json();
    }

    // Get a single settlement by ID
    async findOne(id: number, token: string = ''): Promise<ISettlement> {
        const response = await fetch(`${this.baseUrl}/${id}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch settlement with ID ${id}`);
        }
        return await response.json();
    }

    async create(data: ISettlement, token: string = ''): Promise<ISettlement> {
        if (!token) {
            throw new Error('No token provided');
        }

        const response = await fetch(`${this.baseUrl}/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            let { error } = await response.json();
            if (error.name === "UserNotAuthorized") {
                throw new Error("Solo el liquidador puede liquidar facturas");
            }

            if (error.name === "DuplicatedSettlementCode") {
                throw new Error("El código de liquidación ya existe");
            }

            throw error
        }

        return response.json();
    }


    // Update an existing settlement
    async update(data: ISettlement, token: string = ''): Promise<ISettlement> {
        if (!token) {
            throw new Error('No token provided');
        }

        const response = await fetch(`${this.baseUrl}/${data.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            let { error } = await response.json();
            if (error.name === "UserNotAuthorized") {
                throw new Error("Solo el liquidador puede actualizar liquidaciones");
            }

            throw error
        }

        return await response.json();
    }

    // Delete a settlement by ID
    async delete(id: number, token: string = ''): Promise<void> {
        const response = await fetch(`${this.baseUrl}/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            let { error } = await response.json();
            if (error.name === "UserNotAuthorized") {
                throw new Error("Solo el liquidador puede eliminar liquidaciones");
            }

            throw error
        }
    }
}

export default new SettlementService();