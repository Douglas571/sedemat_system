import { IGrossIncome } from "../util/types"
import dayjs from "dayjs"

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

// GET all gross incomes
export async function getAllGrossIncomes(): Promise<IGrossIncome[]> {
    const response = await fetch(`${HOST}/v1/gross-incomes`)
    if (!response.ok) {
        const errorData = await response.json()
        throw new Error(`Failed to get gross incomes: ${errorData.error || response.statusText}`)
    }
    const grossIncomes = await response.json()
    return grossIncomes
}

// GET all gross incomes by business id
export async function getAllGrossIncomesByBusinessId(businessId: number): Promise<IGrossIncome[]> {
    const response = await fetch(`${HOST}/v1/gross-incomes/business/${businessId}`)
    if (!response.ok) {
        const errorData = await response.json()
        throw new Error(`Failed to get gross incomes: ${errorData.error || response.statusText}`)
    }
    const grossIncomes = await response.json()
    return grossIncomes.map((grossIncome: IGrossIncome) => ({
        ...grossIncome,
        period: dayjs(grossIncome.period)
    }))
}

// GET all gross incomes by business id
export async function getAllGrossIncomesByInvoiceId(businessId: number): Promise<IGrossIncome[]> {
    const response = await fetch(`${HOST}/v1/gross-incomes/invoice/${businessId}`)
    if (!response.ok) {
        const errorData = await response.json()
        throw new Error(`Failed to get gross incomes: ${errorData.error || response.statusText}`)
    }
    const grossIncomes = await response.json()
    return grossIncomes.map((grossIncome: IGrossIncome) => ({
        ...grossIncome,
        period: dayjs(grossIncome.period)
    }))
}

// GET gross income by id
export async function getGrossIncomeById(grossIncomeId: number): Promise<IGrossIncome> {
    const response = await fetch(`${HOST}/v1/gross-incomes/${grossIncomeId}`)
    if (!response.ok) {
        const errorData = await response.json()
        throw new Error(`Failed to get gross income: ${errorData.error || response.statusText}`)
    }
    const grossIncome = await response.json()
    console.log('grossIncome in api', grossIncome)
    return {
        ...grossIncome,
        period: dayjs(grossIncome.period)
    }
}

// UPDATE gross income

export async function updateGrossIncome(grossIncome: IGrossIncome): Promise<IGrossIncome> {
    const response = await fetch(`${HOST}/v1/gross-incomes/${grossIncome.id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(grossIncome)
    })

    if (!response.ok) {
        const errorData = await response.json()
        throw new Error(`Failed to update gross income: ${errorData.error || response.statusText}`)
    }

    const updatedGrossIncome = await response.json()
    return updatedGrossIncome
}

// DELETE gross income
export async function deleteGrossIncome(grossIncomeId: number): Promise<void> {
    const response = await fetch(`${HOST}/v1/gross-incomes/${grossIncomeId}`, {
        method: 'DELETE'
    })

    if (!response.ok) {
        const errorData = await response.json()
        throw new Error(`Failed to delete gross income: ${errorData.error || response.statusText}`)
    }   
}

