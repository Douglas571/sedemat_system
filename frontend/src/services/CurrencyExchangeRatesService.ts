import dayjs from "dayjs"

import { CurrencyExchangeRate } from "../util/types"

const IP = import.meta.env.VITE_BACKEND_IP || "localhost"
const PORT = import.meta.env.VITE_BACKEND_PORT || "3000"
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

    async fetchFromBCV(): Promise<CurrencyExchangeRate> {
      const response = await fetch(`${this.baseUrl}/fetch-from-bcv`, {
        method: 'GET',
      });
      if (!response.ok) {
        throw new Error('Failed to fetch exchange rates from BCV');
      }
      return await response.json();
    }

    async getLastOne(): Promise<CurrencyExchangeRate> {
      const response = await fetch(`${this.baseUrl}/`, {
        method: 'GET',
      });
      if (!response.ok) {
        throw new Error('Failed to fetch last currency exchange rate');
      }

      const allRates = await response.json()
      const lastRate = allRates
        .sort((a: CurrencyExchangeRate, b: CurrencyExchangeRate) => dayjs(a.createdAt).isAfter(dayjs(b.createdAt)) ? -1 : 1)
        [0]

      return lastRate;
    }
  }
  
  export default new CurrencyExchangeRatesService();