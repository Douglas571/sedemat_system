const ROLES = require('../../utils/auth/roles');

const { 
  GrossIncome, 
  Business, 
  BranchOffice, 
  GrossIncomeInvoice, 
  Penalty,
  Settlement
} = require('../../database/models');

const ExcelJS = require('exceljs');
const stream = require('stream');

const dayjs = require('dayjs');


const INITIAL_DATE = dayjs('2024-01-01');

function canDownloadGrossIncomeReport(user) {
  // if user is not an admin, director, fiscal, or collector
  if (!user || [ROLES.LEGAL_ADVISOR].indexOf(user.roleId) === -1) {
    let error = new Error('User not authorized');
    error.name = 'UserNotAuthorized';
    error.statusCode = 401;
    throw error;
  }
}

module.exports.getBusinessesGrossIncomeReportJSON = async function({user}) {

  canDownloadGrossIncomeReport(user);

  let businesses = await getBusinessData();

  let report = getBusinessesGrossIncomeReport(businesses.map(b => b.toJSON()))

  let reportRows = mapBusinessToRowReport(report)

  return reportRows
}

module.exports.getBusinessesGrossIncomeReportExcel = async function({user, stream}) {

  canDownloadGrossIncomeReport(user);

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Reporte de ingresos brutos');

  const headerRow = [
    'RIF del establecimiento',
    'Nombre del establecimiento',
    'N mero de sucursales',
    'Ingresos brutos',
    'Ingresos brutos con multas',
    'Ingresos brutos con multas y sanciones',
    'Ingresos brutos con multas y sanciones con descuentos',
    'Ingresos brutos pagados',
    'Ingresos brutos pendientes de pago',
    'Ingresos brutos con multas y sanciones pendientes de pago',
    'Ingresos brutos con multas y sanciones con descuentos pendientes de pago'
  ];

  worksheet.addRow(headerRow); 

  const reportRows = await module.exports.getBusinessesGrossIncomeReportJSON({user});

  reportRows.forEach(row => worksheet.addRow(row));

  workbook.xlsx.write(stream)
    .then(function() {
        console.log("file saved")
    });

  return
}


async function getBusinessData() {
  return await Business.findAll({
    
    include: [
      {
        model: BranchOffice,
        as: 'branchOffices',
        
      },
      {
        model: GrossIncome,
        as: 'grossIncomes',
        include: [
          {
            model: GrossIncomeInvoice,
            as: 'grossIncomeInvoice',
            include: [
              {
                model: Penalty,
                as: 'penalties',
              },
              {
                model: Settlement,
                as: 'settlement',
              }
            ]
          }
        ]
      }
    ]
  })
}

function getBusinessClassification(monthsPendingToBePaidCount) {
  if (monthsPendingToBePaidCount === 0 ) {
    return 1
  }
  
  if (monthsPendingToBePaidCount <= 3 ) {
    return 2
  }

  if (monthsPendingToBePaidCount <= 6 ) {
    return 3
  }

  return 4
}

function mapBusinessToRowReport(businessReport){

  let reportRows = []

  businessReport.forEach(business => {
      
    if (business?.branchOffices?.length > 0) {
      business.branchOffices.forEach(branchOffice => {

        reportRows.push({
          businessId: business.id,
          businessName: business.businessName,
          businessDni: business.dni,
          branchOfficeNickname: branchOffice.nickname,
          classification: branchOffice.classification, //branchOffice.classification,
          monthsWithoutDeclarationCount: branchOffice.monthsWithoutDeclarationCount,
          monthsPendingToBePaidCount: branchOffice.monthsPendingToBePaidCount,
          
          monthsPendingToBeSettledCount: branchOffice.monthsPendingToBeSettledCount,
          lastMonthSettled: branchOffice.lastMonthSettled,
          lackingMonths: branchOffice.lackingMonths
        })
      })        
    } else {

      let monthsPendingToBePaidCount = business.monthsPendingToBePaidCount + business.monthsWithoutDeclarationCount
      let classification = getBusinessClassification(monthsPendingToBePaidCount)

      reportRows.push({
        businessId: business.id,
        businessName: business.businessName,
        businessDni: business.dni,
        branchOfficeNickname: '--',
        classification: business.classification,
        monthsWithoutDeclarationCount: business.monthsWithoutDeclarationCount,
        monthsPendingToBePaidCount: business.monthsPendingToBePaidCount,
        
        monthsPendingToBeSettledCount: business.monthsPendingToBeSettledCount,
        lastMonthSettled: business.lastMonthSettled,
        lackingMonths: business.lackingMonths
      })
    }
  })

  return reportRows
}

function getBusinessesGrossIncomeReport(businesses) {
  let report = []

  // iterate over each branch office 
  businesses.map((business) => {

    let businessReport = {
      id: business.id,
      businessName: business.businessName,
      dni: business.dni,
    }

    // if it has branch office 
    if (business.branchOffices.length > 0) {
      businessReport.branchOffices = []

      // for each branch office
      business.branchOffices.forEach((branchOffice) => {
        
        let branchOfficeReport = {}
        
        // get the gross incomes for that branch office
        branchOfficeReport.grossIncomes = business.grossIncomes.filter( g => g.branchOfficeId === branchOffice.id)        

        // find the last month settled
        let lastPeriodSettled = branchOfficeReport.grossIncomes.filter( g => g?.grossIncomeInvoice?.settlement != null ).sort((a, b) => dayjs(a.period) - dayjs(b.period)).pop()?.period

        if (lastPeriodSettled) {
          branchOfficeReport.lastMonthSettled = dayjs(lastPeriodSettled)
        }

        branchOfficeReport = {
          ...branchOffice,
          ...branchOfficeReport,
          ...getGrossIncomeReport({
            lastMonthSettled: branchOfficeReport.lastMonthSettled,
            initialPeriod: branchOfficeReport.initialPeriod, 
            grossIncomes: branchOfficeReport.grossIncomes}),

        }
        businessReport.branchOffices.push(branchOfficeReport)

      })

    } else { // if it not has branch office

      let lastPeriodSettled = business.grossIncomes.filter( g => g?.grossIncomeInvoice?.settlement != null ).sort((a, b) => dayjs(a.period) - dayjs(b.period)).pop()?.period

      if (lastPeriodSettled) {
        businessReport.lastMonthSettled = dayjs(lastPeriodSettled)
      }

      businessReport = {
        ...business,
        ...businessReport,
        ...getGrossIncomeReport({
          lastMonthSettled: businessReport.lastMonthSettled, 
          grossIncomes: business.grossIncomes})
      }

    }

    report.push(businessReport)
  })

  return report
}


function getGrossIncomeReport({
  lastMonthSettled,
  grossIncomes

}) {

  let report = {
    monthsWithoutDeclarationCount: 0,
    monthsPendingToBePaidCount: 0,
    monthsPendingToBeSettledCount: 0,
    monthsSettledCount: 0,

    monthsWithoutDeclaration: [],
    monthsPendingToBePaid: [],
    monthsPendingToBeSettled: [],
    monthsSettled: [],

    classification: 1,

    lackingMonths: []
  }

  const CURRENT_DATE = dayjs();

  let initialYear = lastMonthSettled ? lastMonthSettled.year() : INITIAL_DATE.year()
  let finalYear = CURRENT_DATE.year()

  while (initialYear <= finalYear) {

    // console.log({initialYear, finalYear})

    let initialMonth = lastMonthSettled ? lastMonthSettled.month() : INITIAL_DATE.month()
    let finalMonth = CURRENT_DATE.month()

    while (initialMonth < finalMonth) {
      // console.log({initialMonth, finalMonth})

      let grossIncome = grossIncomes.find( g => dayjs(g.period).year() === initialYear && dayjs(g.period).month() === initialMonth)

      if (grossIncome && grossIncome.declarationImage) {

        // check if it's pending to be paid 
        if (!grossIncome?.grossIncomeInvoice?.paidAt) {
          report.monthsPendingToBePaidCount += 1
          report.monthsPendingToBePaid.push(grossIncome)
        }

        // check if it's pending to be settled
        if (!grossIncome?.grossIncomeInvoice?.settlement && grossIncome?.grossIncomeInvoice?.paidAt) { 
          report.monthsPendingToBeSettledCount += 1
          report.monthsPendingToBeSettled.push(grossIncome)
        }

        // check if it's settled
        if (grossIncome?.grossIncomeInvoice?.settlement) {
          // keep this just in case, we need to clarify since when start counting settled months
          report.monthsSettledCount += 1
          report.monthsSettled.push(grossIncome)
        }

      } else {
        // branch office lack declaration for this period
        report.monthsWithoutDeclarationCount += 1
        report.monthsPendingToBePaidCount += 1

        report.lackingMonths.push(dayjs(`${initialYear}-${initialMonth + 1}-03`))

        // if there is a gross income for this period
        if (grossIncome) {
          report.monthsWithoutDeclaration.push(grossIncome)
          
        }
      }

      initialMonth++
    }

    initialYear++
  }

  report.classification = getBusinessClassification(report.monthsPendingToBePaidCount)

  return report
}

exports.getGrossIncomeReport = getGrossIncomeReport