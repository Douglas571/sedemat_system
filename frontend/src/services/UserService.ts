import { IUser } from "../util/types";

const IP = process.env.BACKEND_IP || "localhost"
const PORT = "3000"
const HOST = "http://" + IP + ":" + PORT

const userService = {
    findAll: async (): Promise<IUser[]> => {
        try {
            let res = await fetch(`${HOST}/v1/users`);
            let data = res.json()

            if(res.status !== 200) {
                let error = data.error
                console.log({data})
                throw new Error(data.error.message)
            }

            return data
        } catch (error) {
            console.log(error)
        }

        return []
        
    },
    findById: async (id: number): Promise<IUser | undefined> => {
        return await fetch(`${HOST}/v1/users/${id}`).then(res => res.json());
    },
    update: async (id: number, data: IUser) => {
        return await fetch(`${HOST}/v1/users/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        }).then(res => res.json());
    },
    delete: async (id: number) => {
        return await fetch(`${HOST}/v1/users/${id}`, {
            method: 'DELETE',
        }).then(res => res.json());
    }
};

export default userService;