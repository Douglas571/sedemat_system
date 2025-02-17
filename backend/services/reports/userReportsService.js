const dayjs = require('dayjs');
const _ = require('lodash');
const { 
  User, 
  GrossIncomeInvoice, 
  GrossIncome, 
  Payment,
  Settlement,
  SystemUsageReport,
  UserReportTaxCollector,
  UserReportFiscal,
  UserReportSettler
} = require('../../database/models')

const ROLES = require('../../utils/auth/roles');

// services/userReportsService.js
const userReportsService = {
  /**
   * Get all user reports
   * @returns {Promise<Array>} - Array of user reports
   */
  async getAllReports() {
    throw Error("foo")
    let systemUsageReport = { empty: true }
    return systemUsageReport
  },

  /**
   * Submit a new user report
   * @param {Object} reportData - Data for the new report
   * @returns {Promise<Object>} - The newly created report
   */
  async submitReport({ data, user }) {

    let taxCollectorReports = []
    let fiscalReports = []
    let settlerReports = []

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
        },
        {
          model: Payment,
          as: 'createdPayments'
        }
      ]
    })

    let liquidadores = await User.findAll({
      where: {
        roleId: ROLES.LIQUIDATOR,
      },
      include: [
        {
          model: Settlement,
          as: 'settlements'
        }
      ]
    })

    // for the tax collectors 
    taxCollectors.forEach( t => {
      console.log({ name: t.username, t: t.toJSON()})


      let report = t.grossIncomeInvoices.reduce((acc, curr) => {
        let createdAt = dayjs(curr.createdAt)
        let issuedAt = dayjs(curr.issuedAt)
        let updatedAt = dayjs(curr.updatedAt)

        if (issuedAt) {
          console.log({curr})

          console.log({
            issuedAt: issuedAt.toString(),
            today: dayjs().toString(),

          })
        }
        
        if (createdAt.isSame(dayjs(), 'day')) {
          acc.grossIncomeInvoicesCreated = acc.grossIncomeInvoicesCreated + 1
        }

        if (issuedAt.isSame(dayjs(), 'day')) {
          acc.grossIncomeInvoicesIssued = acc.grossIncomeInvoicesIssued + 1
        }

        if (updatedAt.isSame(dayjs(), 'day')) {
          acc.grossIncomeInvoicesUpdated = acc.grossIncomeInvoicesUpdated + 1
        }

        return acc

      }, {
        grossIncomeInvoicesCreated: 0, grossIncomeInvoicesIssued: 0, grossIncomeInvoicesUpdated: 0
      })

      taxCollectorReports.push(
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

      let paymentsReport = f.createdPayments.reduce((acc, curr) => {
        let createdAt = dayjs(curr.createdAt)

        if (createdAt.isSame(dayjs(), 'day')) {
          acc.paymentsCreated = acc.paymentsCreated + 1
        }

        return acc
      }, {
        paymentsCreated: 0
      })


      fiscalReports.push(
        {
          ..._.pick(f, ['username', 'id']),
          ...grossIncomesReport,
          ...paymentsReport
        })
    })

    // for the settlers LIQUIDATOR: 8
    liquidadores.forEach( l => {
      // console.log(JSON.stringify(l, null, 2))
      let settlements = l.settlements.reduce((acc, curr) => {
        let createdAt = dayjs(curr.createdAt)

        if (createdAt.isSame(dayjs(), 'day')) {
          acc.settlementsCreated = acc.settlementsCreated + 1
        }

        return acc
      }, {
        settlementsCreated: 0
      })

      settlerReports.push({
        ..._.pick(l, ['username', 'id']),
        ...settlements
      })

    })

    // Create the SystemUsageReport
    const systemUsageReport = await SystemUsageReport.create({
      timestamp,
      totalUsers: taxCollectors.length + fiscals.length + liquidadores.length
    });

    // Save tax collectors' reports
    await Promise.all(taxCollectorReports.map(async (report) => {
      await UserReportTaxCollector.create({
        timestamp,
        username: report.username,
        userId: report.id,
        grossIncomeInvoicesCreated: report.grossIncomeInvoicesCreated,
        grossIncomeInvoicesIssued: report.grossIncomeInvoicesIssued,
        grossIncomeInvoicesUpdated: report.grossIncomeInvoicesUpdated,
        systemUsageReportId: systemUsageReport.id
      });
    }));

    // Save fiscals' reports
    await Promise.all(fiscalReports.map(async (report) => {
      await UserReportFiscal.create({
        timestamp,
        username: report.username,
        userId: report.id,
        grossIncomesCreated: report.grossIncomesCreated,
        paymentsCreated: report.paymentsCreated,
        systemUsageReportId: systemUsageReport.id
      });
    }));

    // Save settlers' reports
    await Promise.all(settlerReports.map(async (report) => {
      await UserReportSettler.create({
        timestamp,
        username: report.username,
        userId: report.id,
        settlementsCreated: report.settlementsCreated,
        systemUsageReportId: systemUsageReport.id
      });
    }));

    return {
      id: systemUsageReport.id,
      timestamp: systemUsageReport.timestamp,
      totalUsers: systemUsageReport.totalUsers,
      taxCollectors: taxCollectorReports,
      fiscals: fiscalReports,
      settlers: settlerReports,
    };
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