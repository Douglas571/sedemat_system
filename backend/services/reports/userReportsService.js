const dayjs = require('dayjs');
const _ = require('lodash');
const { User, GrossIncomeInvoice, GrossIncome } = require('../../database/models')

const ROLES = require('../../utils/auth/roles');

// services/userReportsService.js
const userReportsService = {
  /**
   * Get all user reports
   * @returns {Promise<Array>} - Array of user reports
   */
  async getAllReports() {
    // TODO: Implement logic to fetch all reports from the database
    throw new Error('Not implemented');
  },

  /**
   * Submit a new user report
   * @param {Object} reportData - Data for the new report
   * @returns {Promise<Object>} - The newly created report
   */
  async submitReport({ data, user }) {
    // TODO: Implement logic to save the report to the database

    let taxCollectorsReport = []
    let fiscalsReport = []
    let timestamp = dayjs()

    // get all user that are fiscals, tax collectors, coordinators and settlers 

    let taxCollectors = await User.findAll({ 
      where: {
        roleId: ROLES.COLLECTOR
      },
      include: [
        {
          model: GrossIncomeInvoice,
          as: 'grossIncomeInvoices'
        }
      ]
    })

    let fiscals = await User.findAll({ 
      where: {
        roleId: ROLES.FISCAL
      },
      include: [
        {
          model: GrossIncome,
          as: 'grossIncomesCreated'
        }
      ]
    })

    // for the tax collectors 
    taxCollectors.forEach( t => {
      console.log({ name: t.username, t: t.toJSON()})


      let report = t.grossIncomeInvoices.reduce((acc, curr) => {
        let createdAt = dayjs(curr.createdAt)
        let issuedAt = dayjs(curr.issuedAt)

        if (issuedAt) {
          console.log({curr})

          console.log({
            issuedAt: issuedAt.toString(),
            today: dayjs().toString(),

          })
        }
        
        if (createdAt.isSame(dayjs(), 'day')) {
          acc.created = acc.created + 1
        }

        if (issuedAt.isSame(dayjs(), 'day')) {
          acc.issued = acc.issued + 1
        }

        return acc

      }, {
        created: 0, issued: 0
      })

      taxCollectorsReport.push(
        {
          ..._.pick(t, ['username', 'id']),
          ...report
        })
    })

    // for the fiscals
    fiscals.forEach( f => {
      let grossIncomesReport = f.grossIncomesCreated.reduce((acc, curr) => {
        let createdAt = dayjs(curr.createdAt)

        if (createdAt.isSame(dayjs(), 'day')) {
          acc.grossIncomesCreated = acc.grossIncomesCreated + 1
        }

        return acc

      }, { grossIncomesCreated: 0 })


      fiscalsReport.push(
        {
          ..._.pick(f, ['username', 'id']),
          ...grossIncomesReport
        })
    })

    return {
      timestamp,
      taxCollectors: taxCollectorsReport,
      fiscals: fiscalsReport
    }

    throw new Error('Not implemented');
  },
};

module.exports = userReportsService;

/**
 * each report for tax collector will have
 *  - a timestamp
 *  - the userId
 *  - the number of invoices created 
 *  - the number of invoices issued for that day 
 */