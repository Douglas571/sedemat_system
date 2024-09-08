// controllers/grossIncomeController.js
const grossIncomeService = require('../services/grossIncomeService');

class GrossIncomeController {
  // GET /gross-incomes
  async getAll(req, res) {
    try {
      const grossIncomes = await grossIncomeService.getAllGrossIncomes();
      res.status(200).json(grossIncomes);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // GET /gross-incomes/:id
  async getById(req, res) {
    try {
      const grossIncome = await grossIncomeService.getGrossIncomeById(req.params.id);
      if (!grossIncome) {
        return res.status(404).json({ message: 'GrossIncome not found' });
      }
      res.status(200).json(grossIncome);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // POST /gross-incomes
  async create(req, res) {
    try {
      const newGrossIncome = await grossIncomeService.createGrossIncome(req.body);
      res.status(201).json(newGrossIncome);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  // PUT /gross-incomes/:id
  async update(req, res) {
    try {
      const updatedGrossIncome = await grossIncomeService.updateGrossIncome(req.params.id, req.body);
      res.status(200).json(updatedGrossIncome);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  // DELETE /gross-incomes/:id
  async delete(req, res) {
    try {
      await grossIncomeService.deleteGrossIncome(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}

module.exports = new GrossIncomeController();