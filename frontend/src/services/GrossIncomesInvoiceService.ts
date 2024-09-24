import dayjs from "dayjs"  
import { ISettlementCreate } from "util/types";
import { ISettlement } from "util/types";

const IP = process.env.BACKEND_IP || "localhost"
const PORT = "3000"
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
        const error = await response.json();
        throw new Error(`Failed to create gross income invoice: ${error.message}`);
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
        const error = await response.json();
        throw new Error(`Failed to update gross income invoice: ${error.message}`);
      }
      return await response.json();
    }
  
    // Delete a gross income invoice by ID
    async delete(id: number): Promise<void> {
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Failed to delete gross income invoice: ${error.message}`);
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

    async addPayment(grossIncomeInvoiceId: number, paymentId: number): Promise<void> {
      const response = await fetch(`${this.paymentsUrl}/${paymentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ grossIncomeInvoiceId }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Failed to associate payment: ${error.message}`);
      }
    }

    async removePayment(grossIncomeInvoiceId: number, paymentId: number): Promise<void> {
      const response = await fetch(`${this.paymentsUrl}/${paymentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ grossIncomeInvoiceId: null }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Failed to remove payment: ${error.message}`);
      }
    }

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
}

export default new GrossIncomesInvoiceService();