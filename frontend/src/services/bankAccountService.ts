import { IBankAccount } from "../util/types";

const IP = process.env.BACKEND_IP || "localhost"
const PORT = process.env.BACKEND_PORT || "3000"
const HOST = "http://" + IP + ":" + PORT

const bankAccountService = {
    findAll: async (): Promise<IBankAccount[]> => {
        try {
            const response = await fetch(`${HOST}/v1/bank-accounts`);
            return await response.json();
        } catch (error) {
            console.error('Error fetching bank accounts:', error);
            throw error;
        }
    },
    findById: async ({ id }: { id: number }): Promise<IBankAccount | undefined> => {
        try {
            const response = await fetch(`${HOST}/v1/bank-accounts/${id}`);
            return await response.json();
        } catch (error) {
            console.error(`Error fetching bank account with id ${id}:`, error);
            throw error;
        }
    },

    create: async ({ data, token }: { data: IBankAccount, token: string | undefined }) => {

        if (!token) {
            throw new Error('No token provided');
        }

        try {
            const response = await fetch(`${HOST}/v1/bank-accounts`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const {error} = await response.json();

                
                if (error.name === "UserNotAuthorized") {
                    throw new Error("Usuario no autorizado");

                }

                throw new Error(`Failed to update bank account: ${error.message}`);
            }

            return await response.json();


        } catch (error) {
            throw error;
        }
    },
    update: async ({id, data, token}: { id: number, data: IBankAccount, token: string | undefined }) => {

        if (!token) {
            throw new Error('No token provided');
        }

        const url = `${HOST}/v1/bank-accounts/${id}`;
        const headers = {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        };
        const body = JSON.stringify(data);

        try {
            const response = await fetch(url, {
                method: 'PUT',
                headers,
                body,
            });

            if (!response.ok) {
                const {error} = await response.json();
                
                if (error.name === "UserNotAuthorized") {
                    throw new Error("Usuario no autorizado");

                }

                throw new Error(`Failed to update bank account: ${error.message}`);
            }

            return await response.json();
        } catch (error) {
            throw error;
        }
    },
    delete: async ({id, token}: { id: number, token: string | undefined }) => {

        if (!token) {
            throw new Error('No token provided');
        }

        const url = `${HOST}/v1/bank-accounts/${id}`;
        const headers = {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        };

        try {
            const response = await fetch(url, {
                method: 'DELETE',
                headers,
            });

            if (!response.ok) {
                const {error} = await response.json();
                if (error.name === "UserNotAuthorized") {
                    throw new Error("Usuario no autorizado");

                }

                throw new Error(`Failed to update bank account: ${error.message}`);
            }

            
        } catch (error) {
            throw error;
        }
    }
};

export default bankAccountService;