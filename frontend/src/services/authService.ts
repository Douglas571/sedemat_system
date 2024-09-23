import { IRole, IUser } from "../util/types";

const IP = process.env.BACKEND_IP || "localhost";
const PORT = "3000";
const HOST = "http://" + IP + ":" + PORT;

interface IUserCredentials {
    username: string;
    password: string;
}

interface IAuthResponse {
    token: string;
    user: IUser;
}

const authService = {
    // POST /v1/auth/login
    login: async (credentials: IUserCredentials): Promise<IAuthResponse | undefined> => {

        try {
            console.log({credentials})
            let res = await fetch(`${HOST}/v1/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(credentials),
            })

            let data = await res.json()

            if (res.status !== 200) {
                let {error} = data

                if (error.name === "UserNotRegistered") {
                    throw new Error("Este usuario no está registrado")
                }

                if (error.name === "IncorrectPassword") {
                    throw new Error("Contraseña Inválida")
                }

                throw new Error(error.message)
            }

            return data
        } catch (error) {
            throw error
        }
    },

    // POST /v1/auth/singup
    singup: async (userData: IUserCredentials): Promise<IAuthResponse | undefined> => {
        return await fetch(`${HOST}/v1/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData),
        }).then(res => res.json());
    },

    // POST /v1/auth/logout
    logout: async (token: string): Promise<void> => {
        return await fetch(`${HOST}/v1/auth/logout`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        }).then(() => {});
    },

    // GET /v1/auth/me (get current user details)
    getCurrentUser: async (token: string): Promise<IAuthResponse['user'] | undefined> => {
        return await fetch(`${HOST}/v1/auth/me`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        }).then(res => res.json());
    },

    getRoles: async (): Promise<IRole[]> => {
        let res = await fetch(`${HOST}/v1/auth/roles`)

        let data = await res.json()

        if (res.status !== 200) {
            throw new Error(data.error.message)
        }

        return data 
    }
};

export default authService;
