import { CurrencyExchangeRate, IGrossIncome } from "./types"

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

export function getWasteCollectionTaxInBs(grossIncome: IGrossIncome) {
    if (grossIncome.chargeWasteCollection && grossIncome.branchOffice) {
        return CurrencyHandler(getWasteCollectionTaxInMMV(grossIncome.branchOffice.dimensions))
            .multiply(getMMVExchangeRate(grossIncome.currencyExchangeRate)).value
    }

    return 0
    
}

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

export function calculateTotalGrossIncomeInvoice(grossIncomes: IGrossIncome[], business: Business, formPrice: number): number {
    let TOTAL = CurrencyHandler(0);
    console.log('TOTAL', TOTAL.value)
    grossIncomes.forEach(g => TOTAL = TOTAL.add(getSubTotalFromGrossIncome(g, business)));

    console.log('TOTAL 2', TOTAL.value)

    TOTAL = TOTAL.add(formPrice);

    console.log('TOTAL 3', TOTAL.value)
    return TOTAL.value;
}