// services/inactivityPeriodService.js

const { InactivityPeriod } = require('../database/models');

module.exports = {
  async createInactivityPeriod(data) {
    if (data.startAt && data.endAt && data.startAt > data.endAt) {
      const error = new Error('startAt cannot be after endAt');
      error.name = 'InvalidPeriod';
      error.statusCode = 400;
      throw error;
    }
    return await InactivityPeriod.create(data);
  },

  async getInactivityPeriods(businessId) {
    return await InactivityPeriod.findAll({ include: ['branchOffice'], where: { businessId } });
  },

  async getInactivityPeriodById(id) {
    return await InactivityPeriod.findByPk(id);
  },

  async updateInactivityPeriod(id, updates) {
    const inactivityPeriod = await InactivityPeriod.findByPk(id);
    if (inactivityPeriod) {
      await inactivityPeriod.update(updates);
      return inactivityPeriod;
    }
    return null;
  },

  async deleteInactivityPeriod(id) {
    const inactivityPeriod = await InactivityPeriod.findByPk(id);
    if (inactivityPeriod) {
      await inactivityPeriod.destroy();
      return true;
    }
    return false;
  },
};
