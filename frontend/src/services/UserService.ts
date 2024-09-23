import { IUser } from "../util/types";

const IP = process.env.BACKEND_IP || "localhost"
const PORT = "3000"
const HOST = "http://" + IP + ":" + PORT

function parseError(error: Error) {
    if (error.name === "UsernameAlreadyTaken") {
        throw new Error("Este nombre de usuario ya está registrado")
    }

    if (error.name === "ContactAlreadyTaken") {
        throw new Error("Este contacto ya está registrado para otro usuario")
    }

    if (error.name === "EmailAlreadyTaken") {
        throw new Error("Este correo ya está registrado para otro usuario")
    }


    if (error.name === "ValidationError") {
        if (error.details.some( d  => d.field === 'roleId')) {
            throw new Error("Debe elegir un rol para el usuario")
        }

        if (error.details.some( d  => d.field === 'password')) {
            throw new Error("Debe elegir una contraseña")
        }
    }

    throw new Error(error.message)
}

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

    create: async (newUser: IUser): Promise<IUser> => {
        let res = await fetch(`${HOST}/v1/users`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(newUser),
        });

        let data = await res.json()

        if (data?.error) {
            console.log({data})

            parseError(data.error)
        }

        return data
    },

    update: async (id: number, newUser: IUser) => {
        let res = await fetch(`${HOST}/v1/users/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(newUser),
        });

        let data = await res.json()

        if (data?.error) {
            console.log({data})

            parseError(data.error)
        }

        return data
    },
    delete: async (id: number): Promise<any> => {
        try {
            const res = await fetch(`${HOST}/v1/users/${id}`, {
                method: 'DELETE',
            });
    
            const data = await res.json();
    
            if (res.status !== 200) {
                throw new Error(data.error.message || 'Failed to delete user');
            }
    
            return data;
        } catch (error) {
            console.log(error);
            throw error;  // Rethrow the error so the caller can handle it
        }
    }
};

export default userService;