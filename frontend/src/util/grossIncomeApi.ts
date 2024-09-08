import { IGrossIncome } from "../util/types"

const IP = process.env.BACKEND_IP || "localhost"
const PORT = "3000"
const HOST = "http://" + IP + ":" + PORT

export async function registerGrossIncome(grossIncome: IGrossIncome): Promise<IGrossIncome> {
    const response = await fetch(`${HOST}/v1/gross-incomes`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(grossIncome)
    });

    if (!response.ok) {
        const errorData = await response.json()
        throw new Error(`Failed to register gross income: ${errorData.error || response.statusText}`)
    }

    const newGrossIncome = await response.json()
    return newGrossIncome
}

export async function uploadDeclarationImage(file: File): Promise<string> {

    const formData = new FormData()
    console.log('file', file);
    formData.append('image', file)

    const response = await fetch(`${HOST}/v1/gross-incomes/declaration-image`, {
        method: 'POST',
        body: formData
    })
    
    if (!response.ok) {
        const errorData = await response.json()
        throw new Error(`Failed to upload declaration image: ${errorData.error || response.statusText}`)
    }

    const imageUrl = await response.json()
    return imageUrl.url
}
