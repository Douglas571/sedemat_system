import { Payment } from "./types"

const IP = process.env.BACKEND_IP || "localhost"
const PORT = "3000"
const HOST = "http://" + IP + ":" + PORT

// A function to fetch a payment by id
export async function fetchPaymentById(id: string): Promise<Payment> {
    const response = await fetch(`${HOST}/v1/payments/${id}`)
    const data = await response.json()
    return data
}

// a function to create a new payment
export async function createPayment(paymentData: Payment): Promise<string> {
    const response = await fetch(HOST + '/v1/payments', {
        method: 'POST', // Specify the method
        headers: {
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
export async function updatePayment(paymentData: Payment): Promise<string> {
    const response = await fetch(HOST + '/v1/payments/' + paymentData.id, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(paymentData)
    })

    if (!response.ok) {
        const data = await response.json()
        console.log({ data })
        throw new Error(data.error)
    }

    // the payment was updated successfully was successful 
    const data = await response.json()
    console.log({ data })

    return JSON.stringify(data)
}

interface PaymentFilters {
    grossIncomeInvoiceId?: number
}

// a function to fetch all payments
export async function findAll(filters?: PaymentFilters) {
    let queryParams = ''

    if (filters) {
        queryParams = '?' + new URLSearchParams(Object.entries(filters).filter(([key, value]) => value !== undefined)).toString()
    }

    console.log({ queryParams })

    const response = await fetch(`${HOST}/v1/payments${queryParams}`)
    const data = await response.json()
    return data
}

