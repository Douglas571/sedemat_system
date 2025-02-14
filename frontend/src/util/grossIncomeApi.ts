import { IGrossIncome } from "../util/types"
import dayjs from "dayjs"
import axios from "axios"

const IP = import.meta.env.VITE_BACKEND_IP || "localhost"
const PORT = import.meta.env.VITE_BACKEND_PORT || "3000"
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

        if (error.statusCode === 401) {
            throw new Error("Solo recaudadores y fiscales pueden registrar declaraciones de ingresos")
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

        if (response.status === 401) {
            throw new Error("Solo recaudadores y fiscales pueden registrar declaraciones de ingresos")
        }

        throw new Error(`Failed to upload declaration image: ${errorData.error || response.statusText}`)
    }

    const imageUrl = await response.json()
    return imageUrl.url
}

// GET all gross incomes
export async function getAllGrossIncomes(token?: string, filters?: any): Promise<IGrossIncome[]> {
    
    const response = await axios(`${HOST}/v1/gross-incomes`, {
        params: {
            ...filters
        }
    })

    const grossIncomes = await response.data
    return grossIncomes
}

export async function getGrossIncomesWithoutInvoice(token: string, filters?: any): Promise<IGrossIncome[]> {
    try {
        let response = await axios.get(`${HOST}/v1/gross-incomes`, {
            headers: {
                'Authorization': `Bearer ${token}`
            },
            params: {
                grossIncomeInvoiceId: 'null',
                ...filters
            }
        })
    
        return response.data
    } catch (error: any) {
        console.error({error})

        if (error.response.status === 401) {
            throw new Error("Usuario no autorizado")        
        }

        throw new Error("Error del servidor")
    }
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

// GET all gross incomes by invoice id
export async function getAllGrossIncomesByInvoiceId(grossIncomeInvoiceId: number): Promise<IGrossIncome[]> {

    let queryString = new URLSearchParams()
    queryString.append('grossIncomeInvoiceId', grossIncomeInvoiceId.toString())
    
    const response = await fetch(`${HOST}/v1/gross-incomes?${queryString.toString()}`)
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

        if (response.status === 401) {
            throw new Error("Solo recaudadores y fiscales pueden actualizar declaraciones de ingresos")
        }

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

        if (response.status === 401) {
            throw new Error("Solo recaudadores y fiscales pueden eliminar declaraciones de ingresos")
        }

        throw new Error(`Failed to delete gross income: ${errorData.error || response.statusText}`)
    }   
}

// ASSOCIATE support files to a gross income
export async function addSupportFiles(grossIncomeId: number, filesIds: number[], token?: string): Promise<void> {
    if (!token) {
        throw new Error('Error al proporcionar credenciales');
    }

    const response = await axios.post(`${HOST}/v1/gross-incomes/${grossIncomeId}/support-files`, { 
        supportFilesIds: filesIds
     }, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    });

    return response.data
}

// DISASSOCIATE support files from a gross income
export async function removeSupportFiles(grossIncomeId: number, filesIds: number[], token?: string): Promise<void> {
    if (!token) {
        throw new Error('Error al proporcionar credenciales');
    }

    const response = await axios.delete(`${HOST}/v1/gross-incomes/${grossIncomeId}/support-files`, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        data: { supportFilesIds: filesIds }
    });

    return response.data
}

interface EditNoteProps {
    data: {
        businessId: number,
        branchOfficeId?: number,
        grossIncomeId: number,
        period: typeof dayjs,
        fiscalMarkAsPaid: boolean,
        fiscalNote?: string,
    },
    token?: string
}

export async function editNote({
    data,
    token
}: EditNoteProps): Promise<void> {
    if (!token) {
        throw new Error('Error al proporcionar credenciales');
    }

    try {
        const response = await axios.put(`${HOST}/v1/gross-incomes/${data.grossIncomeId}/notes`, {
            businessId: data.businessId,
            period: data.period,
            fiscalMarkAsPaid: data.fiscalMarkAsPaid,
            fiscalNote: data.fiscalNote
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.status !== 200) {
            throw new Error(response.data);
        }


    } catch (e) {
        console.error(e);
        throw new Error('Error al editar la nota');
    }
}

export async function fillEmptyGrossIncomes({
    filters,
    token,
}: {
    filters: {
        businessId: number;
        branchOfficeId?: number;
        startDate: string;
        endDate: string;
    };
    token: string;
}) {
    try {
        const response = await axios.post(
            `${HOST}/v1/gross-incomes/fill-empty`,
            filters,
            {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            },
        );

        // Handle the response
        if (response.status === 200) {
            console.log('Empty gross incomes filled successfully:', response.data);
            return response.data; // Return the response data if needed
        } else {
            throw new Error('Failed to fill empty gross incomes');
        }
    } catch (error) {
        if (axios.isAxiosError(error)) {
            const errorMessage = error.response?.data?.error?.msg || error.message;
            throw new Error(`Failed to fill empty gross incomes: ${errorMessage}`);
        } else {
            throw new Error(`Failed to fill empty gross incomes: ${error}`);
        }
    }
}

export async function fillEmptyBulkGrossIncomes({
    filters,
    period,
    token,
}: {
    filters: {
        
    };
    period: string
    token: string;
}) {
    try {
        const response = await axios.post(
            `${HOST}/v1/gross-incomes/fill-empty-many`,
            { period },
            {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            },
        );

        // Handle the response
        if (response.status === 200) {
            console.log('Empty gross incomes filled successfully:', response.data);
            return response.data; // Return the response data if needed
        } else {
            throw new Error('Failed to fill empty gross incomes');
        }
    } catch (error) {
        if (axios.isAxiosError(error)) {
            const errorMessage = error.response?.data?.error?.msg || error.message;
            throw new Error(`Failed to fill empty gross incomes: ${errorMessage}`);
        } else {
            throw new Error(`Failed to fill empty gross incomes: ${error}`);
        }
    }
}