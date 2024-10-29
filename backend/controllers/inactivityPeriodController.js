// controllers/inactivityPeriodController.js

const inactivityPeriodService = require('../services/inactivityPeriodService');

module.exports = {
  async createInactivityPeriod(req, res) {
    try {
      const data = req.body;
      const inactivityPeriod = await inactivityPeriodService.createInactivityPeriod(data);
      return res.status(201).json(inactivityPeriod);
    } catch (error) {
      return res.status(error.statusCode || 400).json({ error: { message: error.message, name: error.name, statusCode: error.statusCode } });
    }
  },

  async getInactivityPeriods(req, res) {
    try {
      const { businessId } = req.params;
      const inactivityPeriods = await inactivityPeriodService.getInactivityPeriods(businessId);
      return res.json(inactivityPeriods);
    } catch (error) {
      return res.status(error.statusCode || 400).json({ error: { message: error.message, name: error.name, statusCode: error.statusCode } });
    }
  },

  async getInactivityPeriodById(req, res) {
    try {
      const { id } = req.params;
      const inactivityPeriod = await inactivityPeriodService.getInactivityPeriodById(id);
      if (!inactivityPeriod) {
        return res.status(404).json({ error: { message: 'Inactivity Period not found', name: 'NotFound', statusCode: 404 } });
      }
      return res.json(inactivityPeriod);
    } catch (error) {
      return res.status(error.statusCode || 400).json({ error: { message: error.message, name: error.name, statusCode: error.statusCode } });
    }
  },

  async updateInactivityPeriod(req, res) {
    try {
      const { id } = req.params;
      const updates = req.body;
      const inactivityPeriod = await inactivityPeriodService.updateInactivityPeriod(id, updates);
      if (!inactivityPeriod) {
        return res.status(404).json({ error: { message: 'Inactivity Period not found', name: 'NotFound', statusCode: 404 } });
      }
      return res.json(inactivityPeriod);
    } catch (error) {
      return res.status(error.statusCode || 400).json({ error: { message: error.message, name: error.name, statusCode: error.statusCode } });
    }
  },

  async deleteInactivityPeriod(req, res) {
    try {
      const { id } = req.params;
      const deleted = await inactivityPeriodService.deleteInactivityPeriod(id);
      if (!deleted) {
        return res.status(404).json({ error: { message: 'Inactivity Period not found', name: 'NotFound', statusCode: 404 } });
      }
      return res.status(204).send();
    } catch (error) {
      return res.status(error.statusCode || 400).json({ error: { message: error.message, name: error.name, statusCode: error.statusCode } });
    }
  },
};

