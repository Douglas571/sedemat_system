import axios, { AxiosError } from "axios";
import { Payment } from "./types"

const IP = process.env.BACKEND_IP || "localhost"
const PORT = process.env.BACKEND_PORT || "3000"
const HOST = "http://" + IP + ":" + PORT

// A function to fetch a payment by id
export async function fetchPaymentById(id: string): Promise<Payment> {
    const response = await fetch(`${HOST}/v1/payments/${id}`)
    const data = await response.json()
    return data
}

// a function to create a new payment
export async function createPayment(paymentData: Payment, token: string): Promise<string> {
    const response = await fetch(HOST + '/v1/payments', {
        method: 'POST', // Specify the method
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(paymentData)
    })

    if (!response.ok) {
        const data = await response.json()
        console.log({ data })
        throw new Error(data.error.msg)
    }

    // the payment was saved successfully was successful 
    const data = await response.json()
    console.log({ data })

    return JSON.stringify(data)
}

// a function to update a payment
export async function updatePayment(paymentData: Payment, token: string): Promise<string> {
    const response = await fetch(HOST + '/v1/payments/' + paymentData.id, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(paymentData)
    })

    if (!response.ok) {
        const {error} = await response.json()
        
        
        if (error.name === "InvoiceAlreadySettledError") {
            throw new Error("Este pago está asociado a una factura liquidada")
        }

        throw new Error(error.msg)
    }

    // the payment was updated successfully was successful 
    const data = await response.json()
    console.log({ data })

    return JSON.stringify(data)
}

interface PaymentFilters {
    businessId?: number,
    grossIncomeInvoiceId?: number,
}

// a function to fetch all payments
export async function findAll(filters?: PaymentFilters) {
    const response = await axios.get(`${HOST}/v1/payments`, {
        params: {
            ...filters
        }
    });
    const data = await response.data;
    return data
}

// a function to delete a payment
export async function deletePayment(id: number, token: string): Promise<void> {
    const response = await fetch(HOST + '/v1/payments/' + id, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    })

    if (!response.ok) {
        const {error} = await response.json()
        throw new Error(error.msg)
    }

    console.log({ response })
}

export async function updateVerifiedStatus(id: number, data: any, token: string = ''): Promise<Payment | undefined > {
    try {
        const response = await axios.put(`${HOST}/v1/payments/${id}/is-verified`, data, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        })

        return response.data
    } catch (err: any) {
        let error = err?.response?.data?.error
        let status = err?.response?.status

        if (status === 400) {
            if (error.name === "InvoiceAlreadySettledError") {
                throw new Error("Este pago está asociado a una factura liquidada")
            }
        }

        if (status === 404) {
            throw new Error("Pago no encontrado")
        }
        
        if (status === 401) {
            throw new Error("Usuario no autorizado")
        }

        if (status === 500) {
            throw new Error("Error del servidor")
        }        
    }
}


export async function getNotAssociatedPayments(token: string): Promise<Payment[]> {
    try {
        let response = await axios.get(`${HOST}/v1/payments/not-associated`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        })
        
        return response.data
    } catch (err: any) {
        let error = err?.response?.data?.error
        let status = err?.response?.status

        console.log({ status, error })

        throw new Error("Error del servidor")
    }
}