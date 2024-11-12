import { IGrossIncome } from "../util/types"
import dayjs from "dayjs"

const IP = process.env.BACKEND_IP || "localhost"
const PORT = "3000"
const HOST = "http://" + IP + ":" + PORT

export async function registerGrossIncome(grossIncome: IGrossIncome, token: string | null): Promise<IGrossIncome> {
    if (!token) {
        throw new Error('Error al proporcionar credenciales')
    }

    try {

        const response = await fetch(`${HOST}/v1/gross-incomes`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(grossIncome)
        });
    
        if (!response.ok) {
            const {error} = await response.json()
            throw error
        }
    
        const newGrossIncome = await response.json()
        return newGrossIncome
    } catch (error) {
        if (error.name === 'PeriodAlreadyExistsError') {
            throw new Error("Ya existe un registro de ingresos para este período")
        }

        throw error
    }
}

export async function uploadDeclarationImage(file: File, token: string | null): Promise<string> {

    if (!token) {
        throw new Error('Error al proporcionar credenciales')
    }

    const formData = new FormData()
    console.log('file', file);
    formData.append('image', file)

    const response = await fetch(`${HOST}/v1/gross-incomes/declaration-image`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`
        },
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

export async function updateGrossIncome(grossIncome: IGrossIncome, token: string | null
): Promise<IGrossIncome> {

    if (!token) {
        throw new Error('Error al proporcionar credenciales')
    }

    if (!grossIncome.id) {
        throw new Error('Se require un id para actualizar la declaración de ingresos')
    }

    const response = await fetch(`${HOST}/v1/gross-incomes/${grossIncome.id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
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
export async function deleteGrossIncome(grossIncomeId: number, token: string): Promise<void> {

    if (!token) {
        throw new Error('Error al proporcionar credenciales')
    }

    if (!grossIncomeId) {
        throw new Error('Se require un id para eliminar la declaración de ingresos')
    }

    const response = await fetch(`${HOST}/v1/gross-incomes/${grossIncomeId}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })

    if (!response.ok) {
        const errorData = await response.json()
        throw new Error(`Failed to delete gross income: ${errorData.error || response.statusText}`)
    }   
}

