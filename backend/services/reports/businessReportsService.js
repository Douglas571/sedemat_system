const ROLES = require('../../utils/auth/roles');

const { 
  GrossIncome, 
  Business, 
  BranchOffice, 
  GrossIncomeInvoice, 
  Penalty,
  Settlement,
  EconomicLicense,
  InactivityPeriod
} = require('../../database/models');



const ExcelJS = require('exceljs');
const stream = require('stream');

const dayjs = require('dayjs');
var isSameOrBefore = require("dayjs/plugin/isSameOrBefore");
dayjs.extend(isSameOrBefore);


const INITIAL_DATE = dayjs('2023-01-01');

const monthMapper = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre'
];

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
    'Contribuyente',
    'Sucursal',
    'Clasificación',

    'Meses pendientes de pagar',
    'Meses sin declaración',
    'Meses pendientes de liquidar',
    'Último mes liquidado',
    
  ];

  worksheet.addRow(headerRow); 

  const reportRows = await module.exports.getBusinessesGrossIncomeReportJSON({user});

  reportRows.forEach(row => {
    let formattedRow = [
      row.businessName,
      row.branchOfficeNickname,
      row.classification,

      row.monthsPendingToBePaidCount,
      row.monthsWithoutDeclarationCount,
      row.monthsPendingToBeSettledCount,
      row.lastMonthSettled ? `${monthMapper[row.lastMonthSettled.month()]}-${row.lastMonthSettled.year()}` : '--',
    ]
    worksheet.addRow(formattedRow)
  });

  const COLORS = {
    1: '30ff45',
    2: 'ffea00',
    3: '0080ff',
    4: 'ff0000',
  }
  
  worksheet.getColumn(3).eachCell(function(cell, rowNumber) {
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: COLORS[cell.value]},
      bgColor: { argb: COLORS[cell.value] }
    }

  })


  workbook.xlsx.write(stream)
    .then(function() {
        console.log("Excel file with the report sent to client")
    });

  return workbook.xlsx
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
      },
      {
        model: EconomicLicense,
        as: 'economicLicenses',
      },
      {
        model: InactivityPeriod,
        as: 'inactivityPeriods',
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

/**
 * Maps a list of business objects to a desired list of report rows. Each row corresponds to a
 * branch office of the business, and the columns are the business id, name, dni, and
 * branch office nickname, classification, months without declaration, months pending
 * to be paid, months pending to be settled, last month settled, and lacking months.
 * If the business does not have any branch offices, a single row is created with the
 * business information and a classification calculated from the sum of months without
 * declaration and months pending to be paid.
 * @param {Business[]} businessReport - The list of business objects.
 * @returns {reportRow[]} - The list of report rows.
 */
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

    let initialPeriod = business.economicLicenses.sort((a, b) => dayjs(a.issuedDate) - dayjs(b.issuedDate)).shift()?.issuedDate

    if (business.economicLicenses.length > 0) {
      console.log({business: business.businessName, initialPeriod: dayjs(initialPeriod).format('YYYY-MM')})
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

        // find the initial period by economic license 
          // sort the licenses 
          // get the first one 
          // get the initial period
        

        

        if (lastPeriodSettled) {
          branchOfficeReport.lastMonthSettled = dayjs(lastPeriodSettled)
        }

        if (initialPeriod) {
          branchOfficeReport.initialPeriod = dayjs(initialPeriod)
          console.log({
            business: business.businessName,
            initialPeriod: dayjs(initialPeriod).format('YYYY-MM'),})
        }

        branchOfficeReport = {
          ...branchOffice,
          ...branchOfficeReport,
          ...getGrossIncomeReport({
            lastMonthSettled: branchOfficeReport.lastMonthSettled,
            initialPeriod: branchOfficeReport.initialPeriod, 
            grossIncomes: branchOfficeReport.grossIncomes,
            inactivityPeriods: business.inactivityPeriods.filter( g => g.branchOfficeId === branchOffice.id),
            economicLicenses: business.economicLicenses,
          }),

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
          initialPeriod,
          lastMonthSettled: businessReport.lastMonthSettled, 
          grossIncomes: business.grossIncomes,
          inactivityPeriods: business.inactivityPeriods,
          economicLicenses: business.economicLicenses,
        })
      }

    }

    report.push(businessReport)
  })

  return report
}


/**
 * Generates a report on the gross income status for a given business.
 * 
 * @param {dayjs.Dayjs} params - The input parameters for generating the report.
 * @param {dayjs.Dayjs} params.initialPeriod - The initial period of the report.
 * @param {dayjs.Dayjs} params.lastMonthSettled - The last month that was settled.
 * @param {Array} params.grossIncomes - An array of gross income records.
 * @param {Array} params.economicLicenses - An array of economic licenses.
 * @param {Array} params.inactivityPeriods - An array of periods during which the business was inactive.
 * 
 * @returns {Object} - A report object containing counts and details of various statuses, including:
 *   - monthsWithoutDeclarationCount: Number of months without declarations.
 *   - monthsPendingToBePaidCount: Number of months pending payment.
 *   - monthsPendingToBeSettledCount: Number of months pending settlement.
 *   - monthsSettledCount: Number of months settled.
 *   - monthsWithoutDeclaration: Array of gross incomes for months without declarations.
 *   - monthsPendingToBePaid: Array of gross incomes pending payment.
 *   - monthsPendingToBeSettled: Array of gross incomes pending settlement.
 *   - monthsSettled: Array of settled gross incomes.
 *   - classification: Business classification based on pending payments.
 *   - lackingMonths: Array of dates for periods lacking declarations.
 */
function getGrossIncomeReport({
  initialPeriod,
  lastMonthSettled,
  grossIncomes,
  // economicLicenses,
  inactivityPeriods
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

  let startToCountSince 

  if (lastMonthSettled) {
    startToCountSince = lastMonthSettled
  } else if (initialPeriod) {
    startToCountSince = initialPeriod
  } else {
    startToCountSince = INITIAL_DATE
  }

  let initialYear = startToCountSince.year()
  let finalYear = CURRENT_DATE.year()

  const inactivityPeriodsList = [] 
  inactivityPeriods.forEach(p => {
    // make a string of the form "YYYY-MM" with all the months in the range between p.startAt and p.endAt

    // take the endAt date
      // push into periods endAt.format("YYYY-MM")
      // if endAt month and year is equal to startAt month and year
        // finish
      // if not, substract 1 month to endAt and repeat 
    
    let startAt = dayjs(p.startAt)
    let endAt = dayjs(p.endAt)
    while (startAt.isSameOrBefore(endAt, 'month')) {

      inactivityPeriodsList.push({
        year: endAt.get('year'),
        month: endAt.get('month'),
      })

      // console.log({
      //   getMonth: endAt.get('month'),
      //   month: endAt.month(),
      // })

      endAt = endAt.subtract(1, 'month')
    }
  })

  // if (inactivityPeriodsList.length > 0) {
  //   console.log({periods: JSON.stringify(inactivityPeriodsList)})
  // }

  // get the oldest economic license in the list 
  // 
  

  while (initialYear <= finalYear) {

    // console.log({initialYear, finalYear})

    let initialMonth = startToCountSince.month()
    let finalMonth = CURRENT_DATE.month()

    while (initialMonth < finalMonth) {
      // console.log({initialMonth, finalMonth})

      // if there is a inactivity period with the same year and month, skip 
      if (inactivityPeriodsList.some(p => {
        // console.log({p})
        // console.log(p.year === initialYear)
        // console.log(p.month === initialMonth)
        return p.year === initialYear && p.month === initialMonth
      })) {
        initialMonth += 1
        console.log(`skipped ${initialYear}-${initialMonth}`)
        continue
      }


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