// services/SettlementService.js
const { Settlement } = require('../database/models');

class SettlementService {
  async createSettlement(data) {
    return Settlement.create(data);
  }

  async getSettlementById(id) {
    return Settlement.findByPk(id);
  }

  async updateSettlement(id, data) {
    const settlement = await Settlement.findByPk(id);
    if (!settlement) throw new Error('Settlement not found');
    return settlement.update(data);
  }

  async deleteSettlement(id) {
    const settlement = await Settlement.findByPk(id);
    if (!settlement) throw new Error('Settlement not found');
    return settlement.destroy();
  }

  async getAllSettlements() {
    return Settlement.findAll();
  }
}

module.exports = new SettlementService();