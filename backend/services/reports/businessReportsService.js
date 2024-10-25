const ROLES = require('../../utils/auth/roles');

const { 
  GrossIncome, 
  Business, 
  BranchOffice, 
  GrossIncomeInvoice, 
  Penalty,
  Settlement
} = require('../../database/models');

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

module.exports.getBusinessesGrossIncomeReportJSON = async function(user) {

  canDownloadGrossIncomeReport(user);

  // I need to get the data

  let businesses = await Business.findAll({
    
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

  let report = {
    name: 'Branch Offices Gross Income Report',

    businesses
  }

  report = getBusinessesGrossIncomeReport(businesses.map(b => b.toJSON()))

  return report
};

function getBusinessesGrossIncomeReport(businesses) {
  const CURRENT_DATE = dayjs();

  console.log({INITIAL_DATE, CURRENT_DATE});

  let report = []

  // iterate over each branch office 
  businesses.map((business) => {

    let businessReport = {
      businessName: business.businessName,
      dni: business.dni,
    }

    // if it has branch office 
    if (business.branchOffices.length > 0) {
      businessReport.branchOffices = []

      // for each branch office
      business.branchOffices.map((branchOffice) => {
        
        let branchOfficeReport = {
          ...branchOffice,
          monthsWithoutDeclarationCount: 0,
          monthsPendingToBePaidCount: 0,
          monthsPendingToBeSettledCount: 0,
          monthsSettledCount: 0,

          monthsWithoutDeclaration: [],
          monthsPendingToBePaid: [],
          monthsPendingToBeSettled: [],
          monthsSettled: [],
        }

        
        // get the gross incomes for that branch office
        branchOfficeReport.grossIncomes = business.grossIncomes.filter( g => g.branchOfficeId === branchOffice.id)

        // get the initial gross income period to count 
        branchOfficeReport.lastMonthSettled = INITIAL_DATE

        // find the last month settled
        let lastPeriodSettled = branchOfficeReport.grossIncomes.filter( g => g?.grossIncomeInvoice?.settlement != null ).sort((a, b) => dayjs(a.period) - dayjs(b.period)).pop()?.period

        if (lastPeriodSettled) {
          branchOfficeReport.lastMonthSettled = dayjs(lastPeriodSettled)
        }

        console.log({lastPeriodSettled: dayjs(lastPeriodSettled)})

        let initialYear = branchOfficeReport.lastMonthSettled.year()
        let finalYear = CURRENT_DATE.year()

        while (initialYear <= finalYear) {

          // console.log({initialYear, finalYear})

          let initialMonth = branchOfficeReport.lastMonthSettled.month()
          let finalMonth = CURRENT_DATE.month()

          while (initialMonth < finalMonth) {
            // console.log({initialMonth, finalMonth})

            let grossIncome = branchOfficeReport.grossIncomes.find( g => dayjs(g.period).year() === initialYear && dayjs(g.period).month() === initialMonth)

            if (grossIncome && grossIncome.declarationImage) {

              // check if it's pending to be paid 
              if (!grossIncome?.grossIncomeInvoice?.paidAt) {
                branchOfficeReport.monthsPendingToBePaidCount += 1
                branchOfficeReport.monthsPendingToBePaid.push(grossIncome)
              }

              // check if it's pending to be settled
              if (!grossIncome?.grossIncomeInvoice?.settlement && grossIncome?.grossIncomeInvoice?.paidAt) { 
                branchOfficeReport.monthsPendingToBeSettledCount += 1
                branchOfficeReport.monthsPendingToBeSettled.push(grossIncome)
              }

              // check if it's settled
              if (grossIncome?.grossIncomeInvoice?.settlement) {
                // keep this just in case, we need to clarify since when start counting settled months
                branchOfficeReport.monthsSettledCount += 1
                branchOfficeReport.monthsSettled.push(grossIncome)
              }

            } else {
              // branch office lack declaration for this period
              branchOfficeReport.monthsWithoutDeclarationCount += 1

              // if there is a gross income for this period
              if (grossIncome) {
                branchOfficeReport.monthsWithoutDeclaration.push(grossIncome)
              }
            }

            initialMonth++
          }

          initialYear++
        }

        businessReport.branchOffices.push(branchOfficeReport)
      })
    } else {
      // if it not has branch office
      businessReport = {
        ...businessReport,
        monthsWithoutDeclarationCount: 0,
        monthsPendingToBePaidCount: 0,
        monthsPendingToBeSettledCount: 0,
        monthsSettledCount: 0,

        monthsWithoutDeclaration: [],
        monthsPendingToBePaid: [],
        monthsPendingToBeSettled: [],
        monthsSettled: [],
      }

      businessReport.lastMonthSettled = INITIAL_DATE

      let lastPeriodSettled = business.grossIncomes.filter( g => g?.grossIncomeInvoice?.settlement != null ).sort((a, b) => dayjs(a.period) - dayjs(b.period)).pop()?.period

      if (lastPeriodSettled) {
        businessReport.lastMonthSettled = dayjs(lastPeriodSettled)
      }

      let initialYear = businessReport.lastMonthSettled.year()
      let finalYear = CURRENT_DATE.year()

      while (initialYear <= finalYear) {

        let initialMonth = businessReport.lastMonthSettled.month()
        let finalMonth = CURRENT_DATE.month()

        while (initialMonth < finalMonth) {

          let grossIncome = business.grossIncomes.find( g => dayjs(g.period).year() === initialYear && dayjs(g.period).month() === initialMonth)

          if (grossIncome && grossIncome.declarationImage) {

            // check if it's pending to be paid 
            if (!grossIncome?.grossIncomeInvoice?.paidAt) {
              businessReport.monthsPendingToBePaidCount += 1
              businessReport.monthsPendingToBePaid.push(grossIncome)
            }

            // check if it's pending to be settled
            if (!grossIncome?.grossIncomeInvoice?.settlement && grossIncome?.grossIncomeInvoice?.paidAt) { 
              businessReport.monthsPendingToBeSettledCount += 1
              businessReport.monthsPendingToBeSettled.push(grossIncome)
            }

            // check if it's settled
            if (grossIncome?.grossIncomeInvoice?.settlement) {
              // keep this just in case, we need to clarify since when start counting settled months
              businessReport.monthsSettledCount += 1
              businessReport.monthsSettled.push(grossIncome)
            }

          } else {
            // branch office lack declaration for this period
            businessReport.monthsWithoutDeclarationCount += 1

            // if there is a gross income for this period
            if (grossIncome) {
              businessReport.monthsWithoutDeclaration.push(grossIncome)
            }
          }
          initialMonth++
        }

        initialYear++
      }

    }

    report.push(businessReport)
  })

  return report
}
