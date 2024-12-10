/// <reference types="cypress" />

// Welcome to Cypress!
//
// This spec file contains a variety of sample tests
// for a todo list app that are designed to demonstrate
// the power of writing tests in Cypress.
//
// To learn more about how Cypress works and
// what makes it such an awesome testing tool,
// please read our getting started guide:
// https://on.cypress.io/introduction-to-cypress

/// <reference types="@testing-library/cypress" />

describe('Settlement printable page', () => {

  beforeEach(() => {
    
  })

  it('should check the data test ids 1', () => {

    // cy.get('[data-test="total-bs"]').should('be.visible')
    cy.visit('http://localhost:5173/printable/134/gross-incomes-invoice/51/settlement')

    cy.wait(1000)
    
    



    const expected = {
      'settlement-code': 'COMPROBANTE DE INGRESO N°9812',
      'settlement-date': 'PUERTO CUMAREBO; 11 DE NOVIEMBRE DE 2024',
      
      'business-name': 'BDT BANCO DIGITAL DE LOS TRABAJADORES BANCO UNIVERSAL C.A. (PRINCIPAL)',
      'business-rif': 'G-20009148-7',
      'description': 'PAGO POR: IMPUESTO SOBRE ACTIVIDAD ECONOMICA CORRESPONDIENTE AL MES DE OCTUBRE DEL AÑO 2024',
      'amount-in-letters': 'MIL CUATROCIENTOS SETENTA Y NUEVE BOLÍVARES CON OCHENTA Y UN CÉNTIMOS',
      'total-bs': '1.479,81 Bs.',
      'bank-name': 'BANCO BICENTENARIO',
      'bank-account-number': '0175-0162-3100-7494-9290',
      'beneficiary': 'SEDEMAT',
      'payment-date': '11/11/2024',
      'references': '031162',
      'settled-by-user-person-full-name': 'POMPELLO JESÚS LEMUS DUMONT',
    }

    const settlementItems = [
      {
        code: '301020700', // patente de industria y comercio
        amount: '1.407,74 Bs.'
      },
      {
        code: '301090101', // INGRESO POR FORMULARIOS Y GACETAS MUNICIPALES
        amount: '72,07 Bs.'
      },
    ]

    Object.entries(expected).forEach(([key, value]) => {
      cy.get(`[data-testid="${key}"]`).contains(value)
    })

    settlementItems.forEach((item, index) => {
      cy.get(`[data-testid="settlement-item-amount-bs-${item.code}"]`).contains(item.amount)
    })
  })

  it('should check the data test ids 2', () => {

    // cy.get('[data-test="total-bs"]').should('be.visible')


    cy.visit('http://localhost:5173/printable/176/gross-incomes-invoice/99/settlement')

    cy.wait(1000)

    const expected = {
      'settlement-code': 'COMPROBANTE DE INGRESO N°7491',
      'settlement-date': 'PUERTO CUMAREBO; 08 DE DICIEMBRE DE 2023',

      'business-name': 'BRACHO, C.A (PRINCIPAL)',
      'business-rif': 'J-31118525-9',
      'description': 'PAGO POR: IMPUESTO SOBRE ACTIVIDAD ECONOMICA CORRESPONDIENTE A LOS MESES DE JUNIO, JULIO Y AGOSTO DEL AÑO 2023',
      'amount-in-letters': 'MIL DOSCIENTOS SESENTA Y NUEVE BOLÍVARES CON SIETE CÉNTIMOS',
      'total-bs': '1.269,07 Bs.',
      'bank-name': 'BANCO DE VENEZUELA',
      'bank-account-number': '0102-0339-2500-0107-1892',
      'beneficiary': 'SEDEMAT',
      'payment-date': '06/12/2023',
      'references': '4067 - 0107 - 1436 - 2969',
      'settled-by-user-person-full-name': 'LICDA. RITA M. COLINA C.',
    }

    const settlementItems = [
      {
        code: '301021200', // DEUDA MOROSA
        amount: '1.114,21 Bs.'
      },
      {
        code: '301035400', // ASEO
        amount: '109,86 Bs.'
      },
      {
        code: '301090101', // INGRESO POR FORMULARIOS Y GACETAS MUNICIPALES
        amount: '45,00 Bs.'
      },
    ]

    Object.entries(expected).forEach(([key, value]) => {
      cy.get(`[data-testid="${key}"]`).contains(value)
    })

    settlementItems.forEach((item, index) => {
      cy.get(`[data-testid="settlement-item-amount-bs-${item.code}"]`).contains(item.amount)
    })
  })

  it('should check the data test ids 3', () => {

    // cy.get('[data-test="total-bs"]').should('be.visible')


    cy.visit('http://localhost:5173/printable/176/gross-incomes-invoice/99/settlement')

    cy.wait(1000)

    const expected = {
      'settlement-code': 'COMPROBANTE DE INGRESO N°7491',
      'settlement-date': 'PUERTO CUMAREBO; 08 DE DICIEMBRE DE 2023',

      'business-name': 'BRACHO, C.A (PRINCIPAL)',
      'business-rif': 'J-31118525-9',
      'description': 'PAGO POR: IMPUESTO SOBRE ACTIVIDAD ECONOMICA CORRESPONDIENTE A LOS MESES DE JUNIO, JULIO Y AGOSTO DEL AÑO 2023',
      'amount-in-letters': 'MIL DOSCIENTOS SESENTA Y NUEVE BOLÍVARES CON SIETE CÉNTIMOS',
      'total-bs': '1.269,07 Bs.',
      'bank-name': 'BANCO DE VENEZUELA',
      'bank-account-number': '0102-0339-2500-0107-1892',
      'beneficiary': 'SEDEMAT',
      'payment-date': '06/12/2023',
      'references': '4067 - 0107 - 1436 - 2969',
      'settled-by-user-person-full-name': 'LICDA. RITA M. COLINA C.',
    }

    const settlementItems = [
      {
        code: '301021200', // DEUDA MOROSA
        amount: '1.114,21 Bs.'
      },
      {
        code: '301035400', // ASEO
        amount: '109,86 Bs.'
      },
      {
        code: '301090101', // INGRESO POR FORMULARIOS Y GACETAS MUNICIPALES
        amount: '45,00 Bs.'
      },
    ]

    Object.entries(expected).forEach(([key, value]) => {
      cy.get(`[data-testid="${key}"]`).contains(value)
    })

    settlementItems.forEach((item, index) => {
      cy.get(`[data-testid="settlement-item-amount-bs-${item.code}"]`).contains(item.amount)
    })
  })
})



