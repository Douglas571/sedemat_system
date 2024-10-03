// services/SettlementService.js
const { Settlement, User, Person } = require('../database/models');

const grossIncomeInvoiceService = require('./grossIncomeInvoiceService');

class SettlementService {
  async createSettlement(data) {
    console.log({newSettlement: data})

    if (data.grossIncomeInvoiceId) {
      const grossIncomeInvoice = await grossIncomeInvoiceService.getGrossIncomeInvoiceById(data.grossIncomeInvoiceId);

      const canBeSettled = grossIncomeInvoice?.canBeSettled;
      
      if (!canBeSettled) {
        
        let error = new Error('GrossIncomeInvoice can\'t be settled');
        error.name = "GrossIncomeInvoiceCantBeSettled";
        throw error
      }
    }

    return Settlement.create(data);
  }

  async getSettlementById(id) {
    return Settlement.findByPk(id, {
      include: [
        {
          model: User,
          as: "settledByUser",
          include: [
            {
              model: Person,
              as: "person",
            }
          ]
        }
      ]});
  }

  async updateSettlement(id, data) {
    const settlement = await Settlement.findByPk(id);
    if (!settlement) throw new Error('Settlement not found');
    return settlement.update(data);
  }

  async deleteSettlement(id) {
    
    const settlement = await Settlement.findByPk(id);
    if (!settlement) throw new Error('Settlement not found');
    return await settlement.destroy();
  }

  async getAllSettlements() {
    return Settlement.findAll();
  }


}

module.exports = new SettlementService();