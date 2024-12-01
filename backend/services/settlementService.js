// services/SettlementService.js
const { Settlement, User, Person } = require('../database/models');
const dayjs = require('dayjs');

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
    try {
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

      let existentSettlements = await Settlement.findAll({
        where: {
          code: data.code
        }
      })

      if (existentSettlements && existentSettlements.some( settlement => dayjs(settlement.settledAt).isSame(dayjs(data.settledAt), 'year'))) {
        let error = new Error('A settlement with this code and date already exists');
        error.name = "DuplicatedSettlementCode";
        error.statusCode = 400
        throw error
      }

      let returnedSettlement = await Settlement.create(data);

      return returnedSettlement
    } catch (error) {

      if (error.name === "SequelizeUniqueConstraintError") {
        
        let err = new Error("A settlement with this gross income invoice already exists");
        err.message = "A settlement with this gross income invoice already exists"
        err.name = "DuplicatedSettlementCode"

        throw err
      }

      throw error
    }
    
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
    if (!settlement) {
      let error = new Error('Settlement not found');
      error.name = "SettlementNotFound";
      error.statusCode = 404
      throw error
    }


    
    let existentSettlements = await Settlement.findAll({
      where: {
        code: settlement.code,
        id: {[Op.ne]: id}
      }
    })

    if (existentSettlements && existentSettlements.some( settlement => dayjs(settlement.settledAt).isSame(dayjs(data.settledAt), 'year'))) {
      let error = new Error('A settlement with this code and date already exists');
      error.name = "DuplicatedSettlementCode";
      error.statusCode = 400
      throw error
    }

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