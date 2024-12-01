// controllers/SettlementController.js
const settlementService = require('../services/settlementService');

class SettlementController {
  async create(req, res) {
    try {
      const settlement = await settlementService.createSettlement(req.body, req.user);
      res.status(201).json(settlement);
    } catch (error) {
      res.status(400).json({ error: {
        message: error.message,
        ...error
      } });
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
      res.status(500).json({ error: error });
    }
  }

  async update(req, res) {
    try {
      const settlement = await settlementService.updateSettlement(req.params.id, req.body, req.user);
      res.status(200).json(settlement);
    } catch (error) {
      res.status(400).json({ error: error });
    }
  }

  async delete(req, res) {
    try {
      let result = await settlementService.deleteSettlement(req.params.id, req.user);
      res.status(200).json(result);
    } catch (error) {
      console.log({error});
      res.status(500).json({ error: error });
    }
  }

  async getAll(req, res) {
    try {
      const filters = req.query;
      const settlements = await settlementService.getAllSettlements(req.user, filters);
      res.status(200).json(settlements);
    } catch (error) {
      console.log({error})
      res.status(500).json({ error: error });
    }
  }
}

module.exports = new SettlementController();