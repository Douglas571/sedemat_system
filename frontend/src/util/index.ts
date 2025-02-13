import { CurrencyExchangeRate, IGrossIncome, Business } from "./types"

import { CurrencyHandler, CurrencyHandler4, formatBolivares } from "./currency"
import GrossIncomeInvoice from "pages/GrossIncomeInvoiceEdit"

const IP = import.meta.env.VITE_BACKEND_IP || "localhost"
const PORT = import.meta.env.VITE_BACKEND_PORT || "3000"
const HOST = "http://" + IP + ":" + PORT

export function completeUrl(url?: string): string | null {
    if (!url) return null

    return HOST + url
}

export function getMMVExchangeRate(currencyExchangeRate: CurrencyExchangeRate): number {
	return Math.max(currencyExchangeRate.dolarBCVToBs, currencyExchangeRate.eurosBCVToBs)
}

/**
 * Return the waste collection tax based on the area in square meters (mts2) of the branch office.
 * 
 * @param {number} mts2 - The area in square meters.
 * @returns {number} - The waste collection tax amount.
 */
export function getWasteCollectionTaxInMMV(mts2: number): number {
  // TODO: Study this function in deep and analyze edge cases for mts2

    if (mts2 === null) {
      return 0
    }
    // Return 20 if mts2 is greater than or equal to 300
    if (mts2 > 300) {
        return 20;
    }

    // Return 10 if mts2 is greater than or equal to 50
    if (mts2 > 50) {
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
 * Calculate the total tax for a given gross income without waste collection tax
 * 
 * @param {Object} params - The parameters for the calculation.
 * @param {number} params.grossIncomeInBs - The gross income in Bolivares.
 * @param {number} params.alicuota - The tax rate.
 * @param {number} params.minTaxMMV - The minimum tax in MMV.
 * @param {number} params.MMVToBs - The conversion rate from MMV to Bolivares.
 * @param {IGrossIncome} [params.grossIncome] - Deprecated: The gross income object.
 * @returns {number} The calculated gross income tax in Bolivares.
 */
export function getGrossIncomeTaxInBs({
    grossIncomeInBs,
    alicuota,
    minTaxMMV,
    MMVToBs, 
    grossIncome // TODO: Remove this parameter and test the function
}: {
    grossIncomeInBs: number,
    alicuota: number,
    minTaxMMV: number,
    MMVToBs: number,
    grossIncome?: IGrossIncome // Deprecated
}): number {

    // I want to simplify the function interface
    if (grossIncome) {
      let taxInBs = CurrencyHandler(grossIncome.amountBs).multiply(grossIncome.alicuotaTaxPercent).value
      let minTaxInBs = CurrencyHandler(grossIncome.alicuotaMinTaxMMVBCV).multiply(grossIncome.TCMMVBCV).value

      return Math.max(taxInBs, minTaxInBs)
    }


    let taxInBs = CurrencyHandler(grossIncomeInBs).multiply(alicuota).value
    let minTaxInBs = CurrencyHandler(minTaxMMV).multiply(MMVToBs).value

    return Math.max(taxInBs, minTaxInBs)
}

/**
 * Calculates the waste collection tax in Bolivares based on the gross income object.
 * 
 * @param {IGrossIncome} grossIncome - The gross income object containing relevant information.
 * @returns {number} The waste collection tax in Bolivares.
 */
export function getWasteCollectionTaxInBs(
  grossIncome: IGrossIncome | null, 
  TCMMVBCV?: number, 
  wasteCollectionTaxMMVBCV?: number
): number {	
    if (grossIncome && grossIncome.chargeWasteCollection) {
      return Number(Number(CurrencyHandler4(grossIncome.wasteCollectionTaxMMVBCV).multiply(grossIncome.TCMMVBCV).value).toFixed(2))
    }

    if (TCMMVBCV && wasteCollectionTaxMMVBCV) {
      return Number(Number(CurrencyHandler4(TCMMVBCV).multiply(wasteCollectionTaxMMVBCV).value).toFixed(2))
    }

    return 0
}

export function getMinTaxInBs(
  data?: {grossIncome: IGrossIncome} | null, 
  TCMMVBCV?: number, 
  alicuotaMinTaxMMVBCV?: number
): number {  

  let { grossIncome } = data ?? {}

  if (TCMMVBCV && alicuotaMinTaxMMVBCV) {
    // Convert to fixed with precision 2 (output string) and convert to number again 
    return Number(Number(CurrencyHandler4(TCMMVBCV).multiply(alicuotaMinTaxMMVBCV).value).toFixed(2))
  }

  if (grossIncome) {
    return Number(Number(CurrencyHandler4(grossIncome.TCMMVBCV).multiply(grossIncome.alicuotaMinTaxMMVBCV).value).toFixed(2))
    
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
    // if (!business) {
    //     return 0 //throw new Error('Business not found')
    // }

    // if (!grossIncome.alicuota) {
    //   return 0 // throw new Error('Alicuota not found')
    // }

    let { alicuotaTaxPercent, alicuotaMinTaxMMVBCV } = grossIncome
    let { TCMMVBCV} = grossIncome

    let tax = CurrencyHandler(grossIncome.amountBs).multiply(alicuotaTaxPercent).value
    let minTax = CurrencyHandler(alicuotaMinTaxMMVBCV).multiply(TCMMVBCV).value

    let wasteCollectionTax = 0

    if (grossIncome.chargeWasteCollection) {
        wasteCollectionTax = CurrencyHandler(getWasteCollectionTaxInMMV(grossIncome.branchOffice.dimensions))
            .multiply(TCMMVBCV).value
    }

    let finalTax = Math.max(tax, minTax)

    let subtotal = CurrencyHandler(finalTax).add(wasteCollectionTax).value

    return subtotal
}

export function getMinTaxMMVStringOperationToolTipText({minTaxMMV, TCMMVBCV}: {
  minTaxMMV: number, TCMMVBCV: number
}) {
  return `${CurrencyHandler(minTaxMMV).format()} MMV-BCV x ${formatBolivares(TCMMVBCV)}`
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

    grossIncomes?.forEach(g =>{ 
      let subtotal = getSubTotalFromGrossIncome(g, business)
      TOTAL = TOTAL.add(subtotal)
    });

    TOTAL = TOTAL.add(formPrice);
    return TOTAL.value;
}

/**
 * Converts a number to a string representation in a specific currency format.
 * 
 * @param {number} num - The number to convert.
 * @param {string} [tipoCambio1="bolívar"] - The singular form of the currency name.
 * @param {string} [tipoCambio2="bolívares"] - The plural form of the currency name.
 * @param {number} [centavos=1] - Indicates if centavos should be included. 0 for no centavos, 1 for centavos with words.
 * @param {string} [denominacion=''] - An additional denomination to append to the result.
 * @returns {string} The string representation of the number in the specified currency format.
 */
export function numbersToWords(
    num: number,
    tipoCambio1: string = 'bolívar',
    tipoCambio2: string = 'bolívares',
    centavos: number = 1,
    denominacion: string = ''
  ): string {
    let nEntero: number = Math.floor(num);
    let nDecimal: number = Math.floor(Math.round((num - nEntero) * 100));
    let texto: string = cNumero(nEntero);
  
    // Agrega la moneda
    if (nEntero === 1) {
      texto += ` ${tipoCambio1}`;
    } else {
      if (nEntero % 1000000 === 0) {
        texto += ' De';
      }
      texto += ` ${tipoCambio2}`;
    }

    // Agrega los centavos
    if (centavos === 1) {
      
      if (nDecimal !== 0) {
        texto += ` con ${cNumero(nDecimal)}`;
        texto += nDecimal === 1 ? ' céntimo' : ' céntimos';
      } else {
        texto += ' con cero céntimos';
      }

    } else if (centavos === 0) {
      if (nDecimal !== 0) {
        texto += ` ${nDecimal.toString().padStart(2, '0')}/100`;
      }
    }
  
    // return texto.toUpperCase() + ' ' + denominacion;
    return texto + ' ' + denominacion;
  }
  
  function cNumero(num: number): string {
    let texto: string = '';
  
    const cUnidades = [
      '', 'Un', 'Dos', 'Tres', 'Cuatro', 'Cinco', 'Seis', 'Siete', 'Ocho', 'Nueve', 'Diez',
      'Once', 'Doce', 'Trece', 'Catorce', 'Quince', 'Dieciséis', 'Diecisiete', 'Dieciocho', 'Diecinueve', 'Veinte',
      'Veintiuno', 'Veintidós', 'Veintitrés', 'Veinticuatro', 'Veinticinco', 'Veintiséis', 'Veintisiete', 'Veintiocho', 'Veintinueve'
    ];
    const cDecenas = [
      '', 'Diez', 'Veinte', 'Treinta', 'Cuarenta', 'Cincuenta', 'Sesenta', 'Setenta', 'Ochenta', 'Noventa', 'Cien'
    ];
    const cCentenas = [
      '', 'Ciento', 'Doscientos', 'Trescientos', 'Cuatrocientos', 'Quinientos', 'Seiscientos', 'Setecientos', 'Ochocientos', 'Novecientos'
    ];
  
    const nMillones = Math.floor(num / 1000000);
    const nMiles = Math.floor(num / 1000) % 1000;
    const nCentenas = Math.floor(num / 100) % 10;
    const nDecenas = Math.floor(num / 10) % 10;
    const nUnidades = num % 10;
  
    // Evaluación de Millones
    if (nMillones === 1) {
      texto = `Un Millón${num % 1000000 !== 0 ? ' ' + cNumero(num % 1000000) : ''}`;
      return texto;
    } else if (nMillones >= 2 && nMillones <= 999) {
      texto = `${cNumero(Math.floor(num / 1000000))} Millones${num % 1000000 !== 0 ? ' ' + cNumero(num % 1000000) : ''}`;
      return texto;
    }
  
    // Evaluación de Miles
    if (nMiles === 1) {
      texto = `Mil${num % 1000 !== 0 ? ' ' + cNumero(num % 1000) : ''}`;
      return texto;
    } else if (nMiles >= 2 && nMiles <= 999) {
      texto = `${cNumero(Math.floor(num / 1000))} Mil${num % 1000 !== 0 ? ' ' + cNumero(num % 1000) : ''}`;
      return texto;
    }
  
    // Evaluación desde 0 a 999
    if (num === 100) {
      texto = cDecenas[10];
      return texto;
    } else if (num === 0) {
      texto = 'Cero';
      return texto;
    }
  
    if (nCentenas !== 0) {
      texto = cCentenas[nCentenas];
    }
  
    if (nDecenas !== 0) {
      if (nDecenas === 1 || nDecenas === 2) {
        if (nCentenas !== 0) {
          texto += ' ';
        }
        texto += cUnidades[num % 100];
        return texto;
      } else {
        if (nCentenas !== 0) {
          texto += ' ';
        }
        texto += cDecenas[nDecenas];
      }
    }
  
    if (nUnidades !== 0) {
      if (nDecenas !== 0) {
        texto += ' y ';
      } else if (nCentenas !== 0) {
        texto += ' ';
      }
      texto += cUnidades[nUnidades];
    }
  
    return texto;
  }


  export function getGrossIncomeState({
    grossIncome, 
    invoice, 
    payments
  }: {
    grossIncome: IGrossIncome, 
    invoice?: IGrossIncomeInvoice,
    payments?: IPayment[]
  }): 
  {
    status: string
    badgeStatus: string
  } {
    
    // console.log({grossIncome, invoice})

    if (grossIncome.grossIncomeInvoiceId && !invoice) {
      return {
        status: 'Cargando...',
        badgeStatus: 'default',
      }
    }

    let status = 'Sin Declaración'
    let badgeStatus = 'default'

    // TODO: When migrated the existing images in declarationImage field, delete that. 
    if (grossIncome?.supportFiles?.length > 0) {
        if (grossIncome.grossIncomeInvoiceId) {
          status = 'Por Pagar'
          badgeStatus = 'error'
        } else {
          status = 'Por Facturar'
          badgeStatus = 'error'
        }
    }

    if (invoice?.paidAt) {
        if (payments?.some( p => !p?.isVerified)) {
          status = 'Por Consolidar'
        } else {
          status = 'Por Liquidar'
        }
        
        badgeStatus = 'warning'
    }

    if (invoice?.settlement) {
        status = 'Liquidado'
        badgeStatus = 'success'
    }

    return { status, badgeStatus }
  }

  export function getGrossIncomeInvoiceState({
    invoice,
  }: {
    invoice: IGrossIncomeInvoice
  }) {
    let state = 'Pendiente'
    let badgeStatus = 'error'

    if (invoice?.paidAt) {
        if (invoice?.payments.some(p => !p.isVerified)) {
            state = 'Por Consolidar'
        } else {
            state = 'Por Liquidar'
        }

        badgeStatus = 'warning'
    }

    if (invoice?.settlement) {
        state = 'Liquidado'
        badgeStatus = 'success'
    }

    // console.log({text, badgeStatus})

    return {
      state, badgeStatus
    }
  }