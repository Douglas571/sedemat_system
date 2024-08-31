const {CurrencyExchangeRates} = require('../database/models')

const cheerio = require('cheerio');

class CurrencyExchangeRatesService {
  static async create(data) {
    return await CurrencyExchangeRates.create(data);
  }

  static async findAll() {
    return await CurrencyExchangeRates.findAll();
  }

  static async findById(id) {
    return await CurrencyExchangeRates.findByPk(id);
  }

  static async update(id, data) {
    const record = await CurrencyExchangeRates.findByPk(id);
    if (!record) {
      throw new Error('Record not found');
    }
    return await record.update(data);
  }

  static async delete(id) {
    const record = await CurrencyExchangeRates.findByPk(id);
    if (!record) {
      throw new Error('Record not found');
    }
    return await record.destroy();
  }

  static async fetchFromBCV() {
    try {

      // Retrieve the last created exchange rates record
      const lastRates = await CurrencyExchangeRates.findOne({
        order: [['createdAt', 'DESC']],
      });
  
      // Get the current time
      const now = new Date();
  
      // If there's a last record, check if it's within the last hour
      if (lastRates) {
        const lastCreatedAt = new Date(lastRates.createdAt);
        const diffInMinutes = (now.getTime() - lastCreatedAt.getTime()) / (1000 * 60);
  
        if (diffInMinutes <= 1) {
          // If the last record is less than or equal to 1 hour old, return it
          return lastRates.toJSON();
        }
      }

      const response = await fetch('https://www.bcv.org.ve/');
    
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const html = await response.text();
      const $ = cheerio.load(html);


      const dolarRate = Number($('#dolar .field-content .row div:nth-child(2)').text().trim().replace(',', '.'));
      const euroRate = Number($('#euro .field-content .row div:nth-child(2)').text().trim().replace(',', '.'));

      const exchangeRates = {
        dolarBCVToBs: dolarRate,
        euroBCVToBs: euroRate
      }

      // Save the fetched data to the database
      const newRates = await CurrencyExchangeRates.create({
        dolarBCVToBs: exchangeRates.dolarBCVToBs.toFixed(2),
        eurosBCVToBs: exchangeRates.euroBCVToBs.toFixed(2),
        dolarBlackToBs: null, // Set as null since we're not fetching this data from BCV
        euroBlackToBs: null,  // Set as null since we're not fetching this data from BCV
      });

      return newRates.toJSON()
    } catch (error) {
      console.log({error})
      console.error('Error fetching exchange rates:', error);
    }
  }
}

module.exports = CurrencyExchangeRatesService