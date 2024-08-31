const CurrencyExchangeRatesService = require('../services/currencyExchangeRatesService');

class CurrencyExchangeRatesController {
  static async create(req, res) {
    try {
      const newRecord = await CurrencyExchangeRatesService.create(req.body);
      res.status(201).json(newRecord);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  static async getAll(req, res) {
    try {
      const records = await CurrencyExchangeRatesService.findAll();
      res.status(200).json(records);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  static async getById(req, res) {
    try {
      const record = await CurrencyExchangeRatesService.findById(parseInt(req.params.id, 10));
      if (!record) {
        return res.status(404).json({ error: 'Record not found' });
      }
      res.status(200).json(record);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  static async update(req, res) {
    try {
      const updatedRecord = await CurrencyExchangeRatesService.update(parseInt(req.params.id, 10), req.body);
      res.status(200).json(updatedRecord);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  static async delete(req, res) {
    try {
      await CurrencyExchangeRatesService.delete(parseInt(req.params.id, 10));
      res.status(204).send();
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  static async fetchFromBCV(req, res) {
    try {
        const updatedRates = await CurrencyExchangeRatesService.fetchFromBCV();
        res.status(200).json(updatedRates);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch exchange rates from BCV' });
    }
  } 
}

module.exports = CurrencyExchangeRatesController