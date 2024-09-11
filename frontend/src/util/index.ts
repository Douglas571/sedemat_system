import { CurrencyExchangeRate, IGrossIncome } from "./types"

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

export function getWasteCollectionTaxInBs(grossIncome: IGrossIncome) {
    if (grossIncome.chargeWasteCollection && grossIncome.branchOffice) {
        return getWasteCollectionTaxInMMV(grossIncome.branchOffice.dimensions) * getMMVExchangeRate(grossIncome.currencyExchangeRate)
    }

    return 0
    
}

export function getSubTotalFromGrossIncome(grossIncome: IGrossIncome, business: Business): number {
    console.log({grossIncome, business})
    if (!business) {
        return 0
    }
    let tax = grossIncome.amountBs * business?.economicActivity.alicuota
    let minTax = business?.economicActivity.minimumTax * getMMVExchangeRate(grossIncome.currencyExchangeRate)
    let wasteCollectionTax = 0

    if (grossIncome.chargeWasteCollection) {
        wasteCollectionTax = getWasteCollectionTaxInMMV(grossIncome.branchOffice.dimensions) * getMMVExchangeRate(grossIncome.currencyExchangeRate)
    }

    let finalTax = Math.max(tax, minTax)

    let subtotal = finalTax + wasteCollectionTax

    return subtotal
}