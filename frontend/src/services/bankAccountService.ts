import { IBankAccount } from "../util/types";

const IP = process.env.BACKEND_IP || "localhost"
const PORT = "3000"
const HOST = "http://" + IP + ":" + PORT

const bankAccountService = {
    findAll: async (): Promise<IBankAccount[]> => {
        return await fetch(`${HOST}/v1/bank-accounts`).then(res => res.json());
    },
    findById: async (id: number): Promise<IBankAccount | undefined> => {
        return await fetch(`${HOST}/v1/bank-accounts/${id}`).then(res => res.json());
    },
    update: async (id: number, data: IBankAccount) => {
        return await fetch(`${HOST}/v1/bank-accounts/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        }).then(res => res.json());
    },
    delete: async (id: number) => {
        return await fetch(`${HOST}/v1/bank-accounts/${id}`, {
            method: 'DELETE',
        }).then(res => res.json());
    }
};

export default bankAccountService;