const IP = process.env.BACKEND_IP || "localhost";
const PORT = "3000";
const HOST = `http://${IP}:${PORT}`;


// export a function to upload dni images in multipart form data
// the argument is a File object
// the returning type is a string containing the url to the dni
export async function uploadDniPicture(file: File): Promise<string> {
    try {
        console.log({file})
        const formData = new FormData();
        formData.append('image', file);

        // make http porst request to backend
        const res = await fetch(`${HOST}/v1/people/dni`, {
            method: 'POST',
            body: formData,
            headers: {
                // 'Content-Type' is automatically set to multipart/form-data when using FormData
            },
        });

        // get the returned json data
        const data = await res.json()
        
        // if response is not ok, throw error
        if (!res.ok && data.error) {
            throw new Error(data.error.message)
        }

        // else, return data.dniPictureUrl
        return data.url
    } catch (error) {
        console.log({error})
        throw error
    }
        
}


// export a function to upload rif images in multipart form data
// the argument is a File object
// it return the rif image url 

export async function uploadRifPicture(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('image', file);

    // make http porst request to backend
    const res = await fetch(`${HOST}/v1/people/rif`, {
        method: 'POST',
        body: formData,
        headers: {
            // 'Content-Type' is automatically set to multipart/form-data when using FormData
        },
    });

    // get the returned json data
    const data = await res.json()

    // if response is not ok, throw error
    if (!res.ok) {
        throw new Error(data.error.message)
    }

    // else, return data.dniPictureUrl
    return data.url
}

import * as api from './api'

const fetchAll = api.getPeople

export default {
    fetchAll
}