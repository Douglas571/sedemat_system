const ExcelJS = require('exceljs')
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
const { Op } = require('sequelize');

const ROLES = require('../../utils/auth/roles');

// services/userReportsService.js
const userReportsService = {

  /**
   * Get all user reports
   * @param {Object} options - Options for filtering reports.
   * @param {Object} options.filters - Filters to apply (e.g., period).
   * @returns {Promise<Array>} - Array of user reports
   */
  async getAllReports({ filters } = {}) {
    let where = {};

    // Apply period filter if provided
    if (filters?.period) {
      const dateStart = dayjs(filters.period).startOf('month').format('YYYY-MM-DD');
      const dateEnd = dayjs(filters.period).endOf('month').format('YYYY-MM-DD');

      where = {
        ...where,
        timestamp: {
          [Op.gte]: dateStart,
          [Op.lte]: dateEnd,
        },
      };
    }

    // Fetch system usage reports with associated user reports
    const systemUsageReports = await SystemUsageReport.findAll({
      where,
      include: [
        {
          model: UserReportTaxCollector,
          as: 'taxCollectorReports',
        },
        {
          model: UserReportFiscal,
          as: 'fiscalReports',
        },
        {
          model: UserReportSettler,
          as: 'settlerReports',
        },
      ],
      order: [['timestamp', 'DESC']], // Order by timestamp descending
    });

    // Group reports by day and select the latest report for each day
    const reportsByDay = systemUsageReports.reduce((acc, report) => {
      const day = dayjs(report.timestamp).format('YYYY-MM-DD'); // Extract the day

      // If no report exists for this day or the current report is newer, update the entry
      if (!acc[day] || dayjs(report.timestamp).isAfter(acc[day].timestamp)) {
        acc[day] = report;
      }

      return acc;
    }, {});

    // Convert the grouped reports back into an array
    const latestReports = Object.values(reportsByDay);

    return latestReports;
  },


  async getAllReportsExcel({ filters, stream }) {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Reporte de usuarios');
  
    // Define the header row for the first table
    const headerRow = [
      'PERSONAL (USUARIO)',
      'ROL',
      'Ingresos brutos creados',
      'Ingresos brutos emitidos',
      'Ingresos brutos actualizados',
      'Pagos creados',
      'Liquidaciones creadas',
    ];
  
    worksheet.addRow(headerRow);
  
    // Fetch the report data in JSON format
    const reportRows = await this.getAllReports({ filters });
  
    // Add rows to the worksheet for the first table
    reportRows.forEach(row => {
      let formattedRow = [
        row.username,
        row.role,
        row.grossIncomeInvoicesCreated || 0,
        row.grossIncomeInvoicesIssued || 0,
        row.grossIncomeInvoicesUpdated || 0,
        row.paymentsCreated || 0,
        row.settlementsCreated || 0,
      ];
      worksheet.addRow(formattedRow);
    });
  
    // Add a title row for "SEGUIMIENTO DIARIO YYYY-MM"
    const periodTitle = `SEGUIMIENTO DIARIO ${dayjs(filters.period).format('YYYY-MM')}`;
    worksheet.addRow([]); // Blank line
    worksheet.addRow([periodTitle]); // Title row
    worksheet.addRow([]); // Blank line
  
    // Prepare the header for the second table (Tax Collectors)
    const daysInMonth = dayjs(filters.period).daysInMonth(); // Number of days in the month
    const taxCollectorHeader = ['PERSONAL', 'ACTIVIDAD'];
  
    // Add columns for each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
      taxCollectorHeader.push(day);
    }
  
    worksheet.addRow(taxCollectorHeader);
  
    // Fetch tax collector data for the second table
    const systemUsageReport = await module.exports.getAllReports({ filters });

    // sort the usage report

    systemUsageReport.forEach( systemUsageReport => {
      // get the tax collectors 

      // get the settlers 

      // get the tax fiscals 
    })
  
    // Write the workbook to the stream
    await workbook.xlsx.write(stream);
    console.log('Excel file with the report sent to the client');
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