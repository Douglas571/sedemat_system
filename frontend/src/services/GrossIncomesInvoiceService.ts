import dayjs from "dayjs"  
import { ISettlementCreate, ISettlement, IGrossIncomeInvoice, IGrossIncomeInvoiceCreate } from "../util/types";
import axios from "axios";


const IP = process.env.BACKEND_IP || "localhost"
const PORT = process.env.BACKEND_PORT || "3000"
const HOST = "http://" + IP + ":" + PORT

class GrossIncomesInvoiceService {
    private host: string;
    private baseUrl: string;
    private paymentsUrl: string;
    constructor(host: string = HOST) {
      this.host = host
      this.baseUrl = host + '/v1/gross-income-invoices'
      this.paymentsUrl = host + '/v1/payments'
    }
  
    // Get all gross income invoices
    async getAll(): Promise<IGrossIncomeInvoice[]> {
      const response = await fetch(`${this.baseUrl}/`);
      if (!response.ok) {
        throw new Error('Failed to fetch gross income invoices');
      }
      return await response.json();
    }

    async getInvoicesToBeFixed(token: string) {

      if (token){
        let response = await axios.get(`${this.baseUrl}/to-be-fixed`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          }
        })
        
        return response.data
      }
    }

    async getAllGrossIncomeInvoicesToBeSettled(token: string) {

      if (token){
        let response = await axios.get(`${this.baseUrl}/to-be-settled`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          }
        })
        
        return response.data
      }
    }
  
    // Get a single gross income invoice by ID
    async getById(id: number): Promise<IGrossIncomeInvoice> {
      const response = await fetch(`${this.baseUrl}/${id}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch gross income invoice with ID ${id}`);
      }
      return await response.json();
    }
  
    // Create a new gross income invoice
    async create(data: IGrossIncomeInvoiceCreate, token: string = ''): Promise<IGrossIncomeInvoice> {

      if (!token){
        throw new Error('No token provided');
      }

      const response = await fetch(`${this.baseUrl}/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const data = await response.json();
        
        if (response.status === 401) {
          throw new Error(`Solo recaudadores y fiscales pueden crear facturas`);
        }

        throw new Error(`Error del servidor`);
        
      }
      return await response.json();
    }
  
    // Update an existing gross income invoice
    async update(data: IGrossIncomeInvoice, token: string = ''): Promise<IGrossIncomeInvoice> {

      if (!token){
        throw new Error('No token provided');
      }

      const response = await fetch(`${this.baseUrl}/${data.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const data = await response.json();
        console.error({ data })
        let {message, name} = data.error

        if (name === "InvoiceAlreadyPaid") {
          throw new Error(`Esta factura ya ha sido pagada`);
        }

        if (response.status === 401) {
          throw new Error(`Solo recaudadores y fiscales pueden crear facturas`);
        }
        
        throw new Error(`Error del servidor`);
      }
      return await response.json();
    }
  
    // Delete a gross income invoice by ID
    async delete(id: number, token: string | null): Promise<void> {
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });
      if (!response.ok) {
        const data = await response.json();

        console.log({data})
        
        if (response.status === 401) {
          throw new Error(`Solo recaudadores y fiscales pueden crear facturas`);
        }
        
        throw new Error(`Error del servidor`);
      }
    }

    async getLastOne(): Promise<IGrossIncomeInvoice> {
      const response = await fetch(`${this.baseUrl}/last`, {
        method: 'GET',
      });
      if (!response.ok) {
        throw new Error('Failed to fetch last gross income invoice');
      }

      const allInvoices = await response.json()
      const lastInvoice = allInvoices
        .sort((a: IGrossIncomeInvoice, b: IGrossIncomeInvoice) => dayjs(a.createdAt).isAfter(dayjs(b.createdAt)) ? -1 : 1)
        [0]

      return lastInvoice;
    }

    async addPayment(grossIncomeInvoiceId: number, paymentId: number, token: string | null): Promise<void> {
      const response = await fetch(`${this.baseUrl}/${grossIncomeInvoiceId}/payments/${paymentId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        
      });
      if (!response.ok) {
        const error = await response.json();

        if (response.status === 401) {
          throw new Error(`Solo recaudadores y fiscales pueden asociar pagos a las facturas`);
        }
        
        throw new Error(`Error del servidor`);
      }
    }

    async removePayment(grossIncomeInvoiceId: number, paymentId: number, token: string | null): Promise<void> {
      const response = await fetch(`${this.baseUrl}/${grossIncomeInvoiceId}/payments/${paymentId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        
      });
      if (!response.ok) {
        const error = await response.json();
        
        if (response.status === 401) {
          throw new Error(`Solo recaudadores y fiscales pueden desasociar pagos de las facturas`);
        }
        
        throw new Error(`Error del servidor`);
      }
    }

    /**
     * @deprecated don't use it
     */
    async markAsPaid(grossIncomeInvoiceId: number, token: string): Promise<void> {
      const response = await fetch(`${this.baseUrl}/${grossIncomeInvoiceId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ 
          paidAt: dayjs().toISOString(),
          // TODO: DELETE
          settlementCode: String(new Date())
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Failed to mark as paid: ${error.message}`);
      }

      return await response.json()
    }

    /**
     * @deprecated don't use it
     */
    async unmarkAsPaid(grossIncomeInvoiceId: number, token: string): Promise<void> {
      const response = await fetch(`${this.baseUrl}/${grossIncomeInvoiceId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ 
          paidAt: null
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Failed to unmark as paid: ${error.message}`);
      }

      return await response.json()
      
    }

    async updateToFixStatus(grossIncomeInvoiceId: number, token: string, data?: {toFix: boolean, toFixReason?: string}): Promise<void> {
      try {
        const response = await fetch(`${this.baseUrl}/${grossIncomeInvoiceId}/fix-status`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(data),
        });

        return await response.json()
        
      } catch (error: any) {
        if (error.response.status === 401) {
          throw new Error(`Solo recaudadores y fiscales pueden actualizar el estatus por corregir de las facturas`);
        }
      }
    }
}

export default new GrossIncomesInvoiceService();