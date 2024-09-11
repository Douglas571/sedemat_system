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

export function getWasteCollectionTaxInMMV(mts2: number): number {
    // Return type 3 if mts2 is greater than or equal to 300
    if (mts2 > 300) {
        return 20;
    }

    // Return type 2 if mts2 is greater than or equal to 50
    if (mts2 > 50) {
        return 10;
    }

    // Return type 1 if mts2 is greater than or equal to 0
    if (mts2 >= 0) {
        return 5;
    }

    // Return 0 if none of the conditions are met
    return 0;
}

export function getSubTotalFromGrossIncome(grossIncome: IGrossIncome, business: Business): number {
    console.log({grossIncome, business})
    if (!business) {
        return 0
    }
    let tax = grossIncome.amountBs * business?.economicActivity.alicuota
    let minTax = business?.economicActivity.minimumTax * getMMVExchangeRate(grossIncome.currencyExchangeRate)
    let wasteCollectionTax = getWasteCollectionTaxInMMV(grossIncome.branchOffice.dimensions) * getMMVExchangeRate(grossIncome.currencyExchangeRate)

    let finalTax = Math.max(tax, minTax)

    let subtotal = finalTax + wasteCollectionTax

    return subtotal
}