const {CurrencyExchangeRates} = require('../database/models')

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
}

module.exports = CurrencyExchangeRatesService