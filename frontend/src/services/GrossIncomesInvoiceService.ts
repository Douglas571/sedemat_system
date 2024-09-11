import dayjs from "dayjs"  

const IP = process.env.BACKEND_IP || "localhost"
const PORT = "3000"
const HOST = "http://" + IP + ":" + PORT

class GrossIncomesInvoiceService {
    private host: string;
    private baseUrl: string;
  
    constructor(host: string = HOST) {
      this.host = host
      this.baseUrl = host + '/v1/gross-incomes-invoice'
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
    async create(data: IGrossIncomeInvoiceCreate): Promise<IGrossIncomeInvoice> {
      // const response = await fetch(`${this.baseUrl}/`, {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify(data),
      // });
      // if (!response.ok) {
      //   const error = await response.json();
      //   throw new Error(`Failed to create gross income invoice: ${error.message}`);
      // }
      // return await response.json();
      return data
    }
  
    // Update an existing gross income invoice
    async update(id: number, data: IGrossIncomeInvoice): Promise<IGrossIncomeInvoice> {
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
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
}
  
export default new GrossIncomesInvoiceService();