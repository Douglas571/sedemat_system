// services/SettlementService.js
const { Settlement, User, Person } = require('../database/models');

const grossIncomeInvoiceService = require('./grossIncomeInvoiceService');

const ROLES = require('../utils/auth/roles');

function isUserLiquidator(user) {
  return user.roleId === ROLES.LIQUIDATOR
}

function checkIfUserIsLiquidator(user) {
  if (!isUserLiquidator(user)) {
    let error = new Error('User not authorized');
    error.name = 'UserNotAuthorized';
    throw error;
  }
}
class SettlementService {
  async createSettlement(data, user) {
    console.log({newSettlement: data})

    checkIfUserIsLiquidator(user)

    if (data.grossIncomeInvoiceId) {
      const grossIncomeInvoice = await grossIncomeInvoiceService.getGrossIncomeInvoiceById(data.grossIncomeInvoiceId);

      // check if some payment is not checked
      if (grossIncomeInvoice.payments.some(payment => !payment.isVerified)) {
        let error = new Error('GrossIncomeInvoice can\'t be settled, some payments are not verified');
        error.name = "PaymentsNotVerified"
        throw error
      }

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

  async updateSettlement(id, data, user) {

    checkIfUserIsLiquidator(user)

    const settlement = await Settlement.findByPk(id);
    if (!settlement) throw new Error('Settlement not found');
    return settlement.update(data);
  }

  async deleteSettlement(id, user) {

    checkIfUserIsLiquidator(user)
    
    const settlement = await Settlement.findByPk(id);
    if (!settlement) throw new Error('Settlement not found');
    return await settlement.destroy();
  }

  async getAllSettlements() {
    return Settlement.findAll();
  }


}

module.exports = new SettlementService();