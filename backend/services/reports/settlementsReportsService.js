const ROLES = require('../../utils/auth/roles');

const { 
  GrossIncome, 
  Business, 
  BranchOffice, 
  GrossIncomeInvoice, 
  Penalty,
  Payment,
  Settlement,
  EconomicLicense,
  InactivityPeriod,
  BusinessActivityCategory,
  File,
  Bank,
} = require('../../database/models');

const { Op } = require('sequelize');

const ExcelJS = require('exceljs');
const stream = require('stream');

const dayjs = require('dayjs');
var isSameOrBefore = require("dayjs/plugin/isSameOrBefore");
dayjs.extend(isSameOrBefore);

require('dayjs/locale/es')

function canDownloadSettlementsReport(user) {
  return true // early return for development purposes

  // if user is not an admin, director, fiscal, or collector
  if (!user || [ROLES.LEGAL_ADVISOR].indexOf(user.roleId) === -1) {
    let error = new Error('User not authorized');
    error.name = 'UserNotAuthorized';
    error.statusCode = 401;
    throw error;
  }
}

const DATE_SEPARATOR = ' - '
function getPaymentDate(payments) {
  if (payments.length === 0) return ''
    
        const paymentDates = payments.reduce((acc, curr) => {
          const currDate = dayjs(curr.paymentDate)
          return [
            ...acc,
            currDate,
          ]
        }, [])
    
        const minDate = paymentDates.reduce((min, curr) => curr < min ? curr : min, paymentDates[0])
        const maxDate = paymentDates.reduce((max, curr) => curr > max ? curr : max, paymentDates[0])
    
        if (dayjs(maxDate).format('DD/MM/YYYY') === dayjs(minDate).format('DD/MM/YYYY')) {
          return dayjs(maxDate).format('DD/MM/YYYY')
        }
    
        return dayjs(minDate).format('DD/MM/YYYY') + DATE_SEPARATOR + dayjs(maxDate).format('DD/MM/YYYY')
}

async function getSettlementsReportJSON({user, filters}) {
  canDownloadSettlementsReport(user);

  let where = {}

  if (filters.settlementDateStart && filters.settlementDateEnd) {
    where = {
      ...where,
      settledAt: {
        [Op.gte]: filters.settlementDateStart,
        [Op.lte]: dayjs(filters.settlementDateEnd).add(1, 'day').format('YYYY-MM-DD')
      }
    }
  }

  let settlemnets = await Settlement.findAll({
    where,
    order: [['settledAt', 'ASC']],
    include: [
      {
        model: GrossIncomeInvoice,
        as: 'grossIncomeInvoice',
        include: [
          { 
            model: Payment, 
            as: 'payments', 
            include: [ 
              { 
                model: Bank, 
                as: 'bank' 
              }
            ] 
          },
        ]
      }
    ]
  });

  let formattedSettlementsReport = settlemnets.map((settlement, idx) => {
    let grossIncomeInvoice = settlement.grossIncomeInvoice

    let item = ''
    let paymentDate = dayjs()
    let paymentBank = {}
    let paymentReference = ''

    let businessName = ''
    let businessDni = ''
    let branchOfficeName = ''

    if (grossIncomeInvoice) {
      item = 'PATENTE DE INDUSTRIA Y COMERCIO'
      paymentDate = grossIncomeInvoice.paidAt
      paymentBank = grossIncomeInvoice.payments[0].bank
      amountInBs = grossIncomeInvoice.totalBs

      businessName = grossIncomeInvoice.businessName
      businessDni = grossIncomeInvoice.businessDni
      branchOfficeName = grossIncomeInvoice.branchOfficeName

      paymentDate = getPaymentDate(grossIncomeInvoice.payments)
    }

    let output = {
      number: idx + 1,
      businessName: `${businessName} (${branchOfficeName})`,
      dni: businessDni,
      code: settlement.code,
      item: item,
      paymentDate: paymentDate,
      settlementDate: settlement.settledAt,
      bankCode: paymentBank.accountNumber.slice(-4),
      bankName: paymentBank.name,
      reference: paymentReference,
      amount: amountInBs
    }

    return output;
  })

  return formattedSettlementsReport

}

module.exports.getSettlementsReportExcel = async ({
  user, filters, stream
}) => {

  canDownloadSettlementsReport(user);

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Reporte de ingresos brutos');

  let title = []

  if (filters.settlementDateStart && filters.settlementDateEnd) {
    title = ['REPORTE DE LIQUIDACIONES DESDE EL DIA' + dayjs(filters.settlementDateStart).format('DD/MM/YYYY') + ' HASTA EL DIA ' + dayjs(filters.settlementDateEnd).format('DD/MM/YYYY')]
  } else {
    title = ['REPORTE DE LIQUIDACIONES']
  }

  worksheet.addRow(title);
  worksheet.addRow([]);

  const headerRow = [
    'N°',
    'RAZON SOCIAL',
    'CEDULA O RIF',
    'NRO COMPROBANTE',

    'PARTIDA',
    'FECHA DEL PAGO',
    'FECHA DE LIQUIDACION',
    'COD.BANCO',
    'BANCO',
    'REFERENCIA',
    'MONTO'
  ];

  worksheet.addRow(headerRow); 

  let settlements = await getSettlementsReportJSON({user, filters});

  settlements.forEach(settlement => {
    let formattedRow = [
      settlement.number,
      settlement.businessName,
      settlement.businessDni,
      settlement.code,

      settlement.item,
      settlement.paymentDate,
      settlement.settlementDate,
      settlement.bankCode,
      settlement.bankName,
      settlement.reference,
      settlement.amount
    ]
    worksheet.addRow(formattedRow)
  })

  // const reportRows = await module.exports.getBusinessesGrossIncomeReportJSON({user});

  // reportRows.forEach(row => {
  //   let formattedRow = [
  //     row.businessName,
  //     row.branchOfficeNickname,
  //     row?.businessActivityCategoryName ?? '--',
  //     row.classification,

  //     row.monthsPendingToBePaidCount,
  //     row.monthsWithoutDeclarationCount,
  //     row.monthsPendingToBeSettledCount,
  //     row.lastMonthSettled ? `${monthMapper[row.lastMonthSettled.month()]}-${row.lastMonthSettled.year()}` : '--',
  //     row.lackingMonths ? row.lackingMonths.map(m => `${monthMapper[m.month()]}-${m.year()}`).join(', ') : '--',
  //   ]
  //   worksheet.addRow(formattedRow)
  // });

  // const COLORS = {
  //   1: '30ff45',
  //   2: 'ffea00',
  //   3: '0080ff',
  //   4: 'ff0000',
  // }
  
  // worksheet.getColumn(3).eachCell(function(cell, rowNumber) {
  //   cell.fill = {
  //     type: 'pattern',
  //     pattern: 'solid',
  //     fgColor: { argb: COLORS[cell.value]},
  //     bgColor: { argb: COLORS[cell.value] }
  //   }

  // })


  workbook.xlsx.write(stream)
    .then(function() {
        console.log("Excel file with the report sent to client")
    });

  return workbook.xlsx
}