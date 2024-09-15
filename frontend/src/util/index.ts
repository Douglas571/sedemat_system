import { CurrencyExchangeRate, IGrossIncome, Business } from "./types"

import { CurrencyHandler, formatBolivares } from "./currency"

const IP = process.env.BACKEND_IP || "localhost"
const PORT = "3000"
const HOST = "http://" + IP + ":" + PORT

export function completeUrl(url: string): string {
    return HOST + url
}

export function getMMVExchangeRate(currencyExchangeRates: CurrencyExchangeRate): number {
	return Math.max(currencyExchangeRates.dolarBCVToBs, currencyExchangeRates.eurosBCVToBs)
}




/**
 * Return the waste collection tax based on the area in square meters (mts2) of the branch office.
 * 
 * @param {number} mts2 - The area in square meters.
 * @returns {number} - The waste collection tax amount.
 */
export function getWasteCollectionTaxInMMV(mts2: number): number {
    // Return 20 if mts2 is greater than or equal to 300
    if (mts2 >= 300) {
        return 20;
    }

    // Return 10 if mts2 is greater than or equal to 50
    if (mts2 >= 50) {
        return 10;
    }

    // Return 5 if mts2 is greater than or equal to 0
    if (mts2 >= 0) {
        return 5;
    }

    // Return 0 if none of the conditions are met
    return 0;
}

/**
 * Calculates the waste collection tax in Bolivares based on the gross income object.
 * 
 * @param {IGrossIncome} grossIncome - The gross income object containing relevant information.
 * @returns {number} The waste collection tax in Bolivares.
 */
export function getWasteCollectionTaxInBs(grossIncome: IGrossIncome) {
    if (grossIncome.chargeWasteCollection && grossIncome.branchOffice) {
        return CurrencyHandler(getWasteCollectionTaxInMMV(grossIncome.branchOffice.dimensions))
            .multiply(getMMVExchangeRate(grossIncome.currencyExchangeRate)).value
    }

    return 0
    
}

/**
 * Calculates the subtotal in bolivares from the gross income object.
 * 
 * @param {IGrossIncome} grossIncome - The gross income object containing relevant information.
 * @param {Business} business - The business object containing relevant information.
 * @returns {number} The subtotal in Bolivares.
 */
export function getSubTotalFromGrossIncome(grossIncome: IGrossIncome, business: Business): number {
    if (!business) {
        return 0
    }
    let tax = CurrencyHandler(grossIncome.amountBs).multiply(business?.economicActivity.alicuota).value
    let minTax = CurrencyHandler(business?.economicActivity.minimumTax).multiply(getMMVExchangeRate(grossIncome.currencyExchangeRate)).value
    let wasteCollectionTax = 0

    if (grossIncome.chargeWasteCollection) {
        wasteCollectionTax = CurrencyHandler(getWasteCollectionTaxInMMV(grossIncome.branchOffice.dimensions))
            .multiply(getMMVExchangeRate(grossIncome.currencyExchangeRate)).value
    }

    let finalTax = Math.max(tax, minTax)

    let subtotal = CurrencyHandler(finalTax).add(wasteCollectionTax).value

    return subtotal
}

/**
 * Calculates the total gross income invoice amount in Bolivares.
 * 
 * @param {IGrossIncome[]} grossIncomes - Array of gross income objects.
 * @param {Business} business - The business object containing relevant information.
 * @param {number} formPrice - The price of the form in Bolivares.
 * @returns {number} The total gross income invoice amount in Bolivares.
 */
export function calculateTotalGrossIncomeInvoice(grossIncomes: IGrossIncome[], business: Business, formPrice: number): number {
    let TOTAL = CurrencyHandler(0);
    grossIncomes?.forEach(g => TOTAL = TOTAL.add(getSubTotalFromGrossIncome(g, business)));
    TOTAL = TOTAL.add(formPrice);
    return TOTAL.value;
}