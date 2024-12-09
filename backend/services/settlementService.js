// services/SettlementService.js
const { Settlement, User, Person, GrossIncomeInvoice, Business } = require('../database/models');
const { Op } = require("sequelize")
const dayjs = require('dayjs');

const grossIncomeInvoiceService = require('./grossIncomeInvoiceService');

const ROLES = require('../utils/auth/roles');
const { SettlementInvalidDateError } = require('../utils/errors');

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

      // get the last settlement sorted by settled at date 
      let lastSettlement = await Settlement.findOne({
        where: {
          code: {
            [Op.lt]: data.code
          }
        },
        order: [
          ['settledAt', 'DESC']
        ]
      })

      let nextSettlement = await Settlement.findOne({
        where: {
          code: {
            [Op.gt]: data.code
          }
        },
        order: [
          ['settledAt', 'DESC']
        ]
      })

      // if there is no last settlement and this date is before that the last in terms of date, throw error
      if (lastSettlement) {
        if (dayjs(data.settledAt).isBefore(dayjs(lastSettlement.settledAt), 'date')) {
          let error = new SettlementInvalidDateError()
          throw error
        }
      }

      if (nextSettlement) {
        if (dayjs(data.settledAt).isAfter(dayjs(nextSettlement.settledAt), 'date')) {
          let error = new SettlementInvalidDateError()
          throw error
        }
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

  async getAllSettlements(user, filters) {

    let where = {};

    if (filters.settlementDateStart && filters.settlementDateEnd) { 
      where.settledAt = {
        [Op.between]: [filters.settlementDateStart, filters.settlementDateEnd]
      }

    }

    return Settlement.findAll({
      include: [
        {
          model: GrossIncomeInvoice,
          as: "grossIncomeInvoice",
        }
      ],
      where
    });
  }


}

module.exports = new SettlementService();