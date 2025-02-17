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
    // TODO: Implement logic to fetch all reports from the database
    throw new Error('Not implemented');
  },

  /**
   * Submit a new user report
   * @param {Object} reportData - Data for the new report
   * @returns {Promise<Object>} - The newly created report
   */
  async submitReport({ data, user }) {
    /*
      the report return an object of the following structure 

      [
        {
          userId,
          roleId,

          grossIncomesCreated,
          PaymentsCreated,
          
          grossIncomeInvoicesCreated,
          grossIncomeInvoicesIssued,
        }
      ]
    
    */


    // TODO: Implement logic to save the report to the database

    let taxCollectorsReport = []
    let fiscalsReport = []
    let settlersReport = []
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

      let paymentsReport = f.createdPayments.reduce((acc, curr) => {
        let createdAt = dayjs(curr.createdAt)

        if (createdAt.isSame(dayjs(), 'day')) {
          acc.paymentsCreated = acc.paymentsCreated + 1
        }

        return acc
      }, {
        paymentsCreated: 0
      })


      fiscalsReport.push(
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

      settlersReport.push({
        ..._.pick(l, ['username', 'id']),
        ...settlements
      })

    })

    let result = {
      timestamp,
      taxCollectors: taxCollectorsReport,
      fiscals: fiscalsReport,
      settlers: settlersReport,
    }
    // Create the SystemUsageReport
    const systemUsageReport = await SystemUsageReport.create({
      timestamp,
      totalUsers: taxCollectors.length + fiscals.length + liquidadores.length
    });

    // Save tax collectors' reports
    await Promise.all(taxCollectorsReport.map(async (report) => {
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
    await Promise.all(fiscalsReport.map(async (report) => {
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
    await Promise.all(settlersReport.map(async (report) => {
      await UserReportSettler.create({
        timestamp,
        username: report.username,
        userId: report.id,
        settlementsCreated: report.settlementsCreated,
        systemUsageReportId: systemUsageReport.id
      });
    }));

    return {
      timestamp,
      taxCollectors: taxCollectorsReport,
      fiscals: fiscalsReport,
      settlers: settlersReport,
      systemUsageReportId: systemUsageReport.id
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