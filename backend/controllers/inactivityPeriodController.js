// controllers/inactivityPeriodController.js

const inactivityPeriodService = require('../services/inactivityPeriodService');

module.exports = {
  async createInactivityPeriod(req, res) {
    try {
      const data = req.body;
      const inactivityPeriod = await inactivityPeriodService.createInactivityPeriod(data);
      return res.status(201).json(inactivityPeriod);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  },

  async getInactivityPeriods(req, res) {
    try {
      const { businessId } = req.params;
      const inactivityPeriods = await inactivityPeriodService.getInactivityPeriods(businessId);
      return res.json(inactivityPeriods);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  },

  async getInactivityPeriodById(req, res) {
    try {
      const { id } = req.params;
      const inactivityPeriod = await inactivityPeriodService.getInactivityPeriodById(id);
      if (!inactivityPeriod) {
        return res.status(404).json({ error: 'Inactivity Period not found' });
      }
      return res.json(inactivityPeriod);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  },

  async updateInactivityPeriod(req, res) {
    try {
      const { id } = req.params;
      const updates = req.body;
      const inactivityPeriod = await inactivityPeriodService.updateInactivityPeriod(id, updates);
      if (!inactivityPeriod) {
        return res.status(404).json({ error: 'Inactivity Period not found' });
      }
      return res.json(inactivityPeriod);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  },

  async deleteInactivityPeriod(req, res) {
    try {
      const { id } = req.params;
      const deleted = await inactivityPeriodService.deleteInactivityPeriod(id);
      if (!deleted) {
        return res.status(404).json({ error: 'Inactivity Period not found' });
      }
      return res.status(204).send();
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  },
};
