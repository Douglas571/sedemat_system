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

import dayjs from 'dayjs'
import weekOfYear from "dayjs/plugin/weekOfYear"

dayjs.extend(weekOfYear);

const dummyTaxCollector = {
  username: 'cheo',
  password: 'cheo2024'
}

const BASE_URL = 'http://localhost:5173'

function selectDropdown(testId, optionText) {
  // open select
  getById(testId).click();

  return cy
    .get('.ant-select-dropdown :not(.ant-select-dropdown-hidden)')
    .find('.ant-select-item-option')
    .each(el => {
      if (el.text() === optionText) {
        cy.wrap(el).click();
      }
    });
}

Cypress.Commands.add('selectDropdown', selectDropdown)


function deleteDeclaration({businessId, period}) {

  cy.visit(`${BASE_URL}/tax-collection/${businessId}`)
  cy.get(`[data-test-id="declarations-tab"]`).click()


  cy.get(`[data-test-id="declarations-tab"]`).click()
  cy.get(`[data-test-id='delete-gross-income-button-${period}']`).click()

  cy.get('.ant-popconfirm-buttons').contains('Sí').click()
  cy.get(`[data-test-id='delete-gross-income-button-${period}']`).should('not.exist');
}

function createGrossIncome({
  businessId,
  grossIncome,
  deleteAfter,
  override
}) {
  cy.visit(`${BASE_URL}/tax-collection/${businessId}`)
  cy.get(`[data-test-id="declarations-tab"]`).click()

  cy.get('body').then(($body) => {
    if ($body.find(`[data-test-id='delete-gross-income-button-${grossIncome.period}']`).length && override) {
      deleteDeclaration({businessId, period: grossIncome.period})
    }

    cy.log("the element exists, about to delete")

    cy.get(`[data-test-id='declarations-add-button']`).click()

    cy.get(`input#period`)
      .clear()
      .type(grossIncome.period)

    cy.get('body').click(50, 50, { force: true })
      

    cy.get(`[data-test-id='update-tcmmv-button']`).click({ force: true })
    cy.get(`[data-test-id='update-alicuota-button']`).click({ force: true})
    cy.get(`[data-test-id='update-waste-collection-button']`).click({ force: true})

      // Upload the image file
      cy.get(`input#declarationImage`).then(subject => {
        cy.fixture('example-image.jpg', 'binary').then(fileContent => {
          const blob = Cypress.Blob.binaryStringToBlob(fileContent, 'image/png');
          const testFile = new File([blob], 'example-image.jpg', { type: 'image/png' });
          const dataTransfer = new DataTransfer();
          dataTransfer.items.add(testFile);
          subject[0].files = dataTransfer.files;
          cy.wrap(subject).trigger('change', { force: true });
        });
      }); 
    
    cy.get(`[data-test-id='submit-gross-income-button']`).click()

    cy.get('.ant-message-notice-content', { timeout: 10000 }).should('be.visible')

    // delete the gross income 
    if (deleteAfter) {
      deleteDeclaration({
        businessId, period: grossIncome.period
      })
    }
    
  })
}

function deleteInvoice({
  businessId,
  period,
}) {

  cy.visit(`${BASE_URL}/tax-collection/${businessId}`)
  cy.get(`[data-test-id="invoices-tab"]`).click()
  
  cy.get(`[data-test-id="invoices-tab"]`).click()
  cy.get(`[data-test-id='delete-gross-income-button'][data-test-months*="${period}"]`, { timeout: 5000 }).then(($el) => {
    if ($el) {
      cy.wrap($el).click()
      cy.get('.ant-popconfirm-buttons').contains('Sí').click()
      cy.get(`[data-test-id='delete-gross-income-button'][data-test-months*="${period}"]`).should('not.exist');
    }
  })
}

function createInvoice({
  businessId,
  grossIncomes,
  deleteAfter,
  override
}) {  


  cy.visit(`${BASE_URL}/tax-collection/${businessId}`)
  cy.get(`[data-test-id="invoices-tab"]`).click()
    
  // grossIncomes.forEach( g => {

  //   cy.get('body').then(($body) => {
  //     if ($body.find(`[data-test-months*="${g.period}"]`).length && override) {
  //       return true
  //     } 
  //     return false
  //   }).then( shouldDelete => {
  //     if (shouldDelete) {
  //       deleteInvoice({period: g.period})
  //     }
  //   })

  // })
  
  // else if ($body.find(`[data-test-months*="${grossIncomes[0].period}"]`).length && !override) {
  //   return 
  // }

  cy.get(`[data-test-id='gross-income-invoice-add-button']`).click()

  cy.wait(1000)


  cy.get(`[data-test-id='select-created-by-user-id']`).click()
  cy.get(`.ant-select-item-option-content`).contains('pola').click()   

  cy.get(`[date-test-id='update-created-by-user-button']`).click()
  cy.get(`[date-test-id='update-checked-by-user-button']`).click()

  // Modify the valid currency exchange rate range
  let week = dayjs().week(); // Get the current week number
  cy.get(`input#TCMMVBCVValidDateRange`).clear().type(`2025-${week}º`); // Type the week in the format "2025-<week>º"

  // Modify the issuedAt date to be in the valid range
  let monday = dayjs().startOf('week').add(1, 'day').format('YYYY-MM-DD'); // Get the Monday of the current week
  cy.get(`input#issuedAt`).clear().type(monday); // Type the date in the format YYYY-MM-DD

  // Click the body at coordinates x=50, y=50 to close any open dropdowns or modals
  cy.get('body').click(50, 50);

  // Click the checkbox
  cy.get('[aria-label="Select all"]').click();

  cy.get(`[data-test-id='submit-form-button']`).click()

  cy.get('.ant-message-notice-content', { timeout: 10000 }).should('be.visible')

  if (deleteAfter) {
    grossIncomes.forEach( g => {

    cy.get('body').then(($body) => {
      if ($body.find(`[data-test-months*="${g.period}"]`).length && override) {
        return true
      } 
      return false
    }).then( shouldDelete => {
      if (shouldDelete) {
        deleteInvoice({businessId, period: g.period})
      }
    })    
  })
  }
}

describe('Settlement printable page', () => {

  beforeEach(() => {
    cy.log("Starting")

    cy.visit(`${BASE_URL}/`)

    cy.get(`[data-test-id="username-input"]`).type(dummyTaxCollector.username)
    cy.get(`[data-test-id="password-input"]`).type(dummyTaxCollector.password)

    cy.get(`[data-test-id="login-button"]`).click()

    cy.contains('Recaudador').should('be.visible')
  })

  afterEach(() => {
    cy.log("Finishing")
  })

  it.skip('tax collector should be able to register a gross income', () => {

    let businessId = 1

    let grossIncome = {
      period: '2024-12'
    }

    createGrossIncome({
      businessId, grossIncome, deleteAfter: true, override: true
    })

  })

  it('tax collector should be able to register 2 gross incomes and create an invoice', () => {

    // cy.get('[data-test="total-bs"]').should('be.visible')


    let businessId = 1

    let grossIncomes = [
      {
        period: '2024-10'
      },
      {
        period: '2024-11'
      }
    ]

    // deleteInvoice({businessId, period: grossIncomes[0].period})

    grossIncomes.forEach( g => {
      createGrossIncome({
        businessId,
        grossIncome: g,
        override: true,
        deleteAfter: false
      })
    })

    createInvoice({
      businessId,
      grossIncomes,
      deleteAfter: true,
      override: true
    })

    grossIncomes.forEach((g) => {
      deleteDeclaration({
        businessId,
        period: g.period
      })
    })
  })
})



