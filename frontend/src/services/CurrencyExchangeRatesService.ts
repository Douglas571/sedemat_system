interface CurrencyExchangeRate {
    id?: number;
    dolarBCVToBs: number;
    eurosBCVToBs: number;
    dolarBlackToBs: number;
    euroBlackToBs: number;
    createdAt?: string;
    updatedAt?: string;
  }
  

const IP = process.env.BACKEND_IP || "localhost"
const PORT = "3000"
const HOST = "http://" + IP + ":" + PORT


  class CurrencyExchangeRatesService {
    private host: string;
    private baseUrl: string;
  
    constructor(host: string = HOST) {
      this.host = host
      this.baseUrl = host + '/v1/currency-exchange-rates'
    }
  
    // Get all currency exchange rates
    async getAll(): Promise<CurrencyExchangeRate[]> {
      const response = await fetch(`${this.baseUrl}/`);
      if (!response.ok) {
        throw new Error('Failed to fetch currency exchange rates');
      }
      return await response.json();
    }
  
    // Get a single currency exchange rate by ID
    async getById(id: number): Promise<CurrencyExchangeRate> {
      const response = await fetch(`${this.baseUrl}/${id}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch currency exchange rate with ID ${id}`);
      }
      return await response.json();
    }
  
    // Create a new currency exchange rate
    async create(data: CurrencyExchangeRate): Promise<CurrencyExchangeRate> {
      const response = await fetch(`${this.baseUrl}/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Failed to create currency exchange rate: ${error.message}`);
      }
      return await response.json();
    }
  
    // Update an existing currency exchange rate
    async update(id: number, data: CurrencyExchangeRate): Promise<CurrencyExchangeRate> {
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Failed to update currency exchange rate: ${error.message}`);
      }
      return await response.json();
    }
  
    // Delete a currency exchange rate by ID
    async delete(id: number): Promise<void> {
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Failed to delete currency exchange rate: ${error.message}`);
      }
    }
  }
  
  export default new CurrencyExchangeRatesService();