const currency = require('currency.js');

const currencyHandler = (value) => currency(value, 
    { 
        // symbol: 'Bs.', 
        pattern: '#', 
        precision: 4,
        separator: '.',
        decimal: ','
    }
)

/**
 * @typedef {Object} IGrossIncome
 * @property {number} id - The unique identifier for the gross income.
 * @property {number} businessId - The ID of the associated business.
 * @property {number} branchOfficeId - The ID of the branch office.
 * @property {BranchOffice} branchOffice - The branch office details.
 * @property {string} period - The period of the gross income.
 * @property {number} amountBs - The amount in Bolívares.
 * @property {string} declarationImage - The image of the declaration.
 * @property {CurrencyExchangeRate} currencyExchangeRate - The currency exchange rate.
 * @property {number} currencyExchangeRatesId - The currency exchange rates ID.
 * @property {IWasteCollectionTax} [wasteCollectionTax] - The waste collection tax.
 * @property {number} [grossIncomeInvoiceId] - The ID of the associated gross income invoice.
 * @property {number} alicuotaId - The ID of the alicuota.
 * @property {IAlicuota} alicuota - The alicuota details.
 * @property {boolean} chargeWasteCollection - Whether the waste collection charge applies.
 * @property {number} TCMMVBCV - The TCMMVBCV value.
 * @property {number} branchOfficeDimensionsMts2 - The dimensions of the branch office in square meters.
 * @property {string} branchOfficeType - The type of branch office.
 * @property {number} alicuotaTaxPercent - The alicuota tax percentage.
 * @property {number} alicuotaMinTaxMMVBCV - The alicuota minimum tax MMVBCV value.
 */



function roundToTwoDecimalPlaces(value) {
  return Number(value.toFixed(2));
}
/**
 * Given a gross income, calculates the tax fields of the invoice.
 *
 * The following tax fields are calculated:
 * - taxInBs: the tax calculated from the gross income amount and the alicuota tax percent
 * - minTaxInBs: the minimum tax calculated from the alicuotaMinTaxMMVBCV and the TCMMVBCV
 * - wasteCollectionTaxInBs: the waste collection tax calculated from the wasteCollectionTaxMMVBCV and the TCMMVBCV
 * - totalTaxInBs: the total tax calculated by taking the maximum of the taxInBs and minTaxInBs and adding the wasteCollectionTaxInBs
 *
 * @param {{grossIncome: IGrossIncome}} - the gross income object with its respective properties.
 * @returns {IGrossIncome} - an object with the tax fields calculated.
 */
function calculateTaxFields({grossIncome}) {

  let calcs = {
      taxInBs: 0,
      minTaxInBs: 0,
      wasteCollectionTaxInBs: 0,
      totalTaxInBs: 0
  }

  calcs.taxInBs = roundToTwoDecimalPlaces(currencyHandler(grossIncome.amountBs).multiply(grossIncome.alicuotaTaxPercent).value)

  calcs.minTaxInBs = roundToTwoDecimalPlaces(currencyHandler(grossIncome.alicuotaMinTaxMMVBCV).multiply(grossIncome.TCMMVBCV).value)

  if (grossIncome.chargeWasteCollection) {
      calcs.wasteCollectionTaxInBs = roundToTwoDecimalPlaces(currencyHandler(grossIncome.wasteCollectionTaxMMVBCV).multiply(grossIncome.TCMMVBCV).value)
  }

  calcs.totalTaxInBs = roundToTwoDecimalPlaces(
    Number(currencyHandler(Math.max(calcs.taxInBs, calcs.minTaxInBs)).add(calcs.wasteCollectionTaxInBs).value))

  return calcs
}

module.exports = {
  calculateTaxFields
}