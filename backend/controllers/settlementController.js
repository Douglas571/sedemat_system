// controllers/SettlementController.js
const settlementService = require('../services/settlementService');

class SettlementController {
  async create(req, res) {
    try {
      const settlement = await settlementService.createSettlement(req.body);
      res.status(201).json(settlement);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async getById(req, res) {
    try {
      const settlement = await settlementService.getSettlementById(req.params.id);
      if (!settlement) {
        return res.status(404).json({ error: {
          message: 'Settlement not found'
        }});
      }
      res.status(200).json(settlement);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async update(req, res) {
    try {
      const settlement = await settlementService.updateSettlement(req.params.id, req.body);
      res.status(200).json(settlement);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async delete(req, res) {
    try {
      await settlementService.deleteSettlement(req.params.id);
      res.status(204).json();
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getAll(req, res) {
    try {
      const settlements = await settlementService.getAllSettlements();
      res.status(200).json(settlements);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new SettlementController();