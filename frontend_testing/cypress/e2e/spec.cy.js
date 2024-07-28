describe('SEDEMAT app', () => {
  beforeEach(() => {
    // Cypress starts out with a blank slate for each test
    // so we must tell it to visit our website with the `cy.visit()` command.
    // Since we want to visit the same URL at the start of all our tests,
    // we include it in our beforeEach function so that it runs before each test
      cy.visit('http://localhost:5173/')
  })

  // it("Create a tax payer", () => {
  //    // Visit the home page
  //   cy.visit('http://localhost:5173');

  //    // Click the link that contains "Nuevo Contribuyente"
  //   cy.contains('a', 'Nuevo Contribuyente').click();

  //    // Verify that the URL is correct
  //   cy.url().should('eq', 'http://localhost:5173/business/new');
  // })

  // it("Should bring a license to a comercial establishment", () => {
    
  // })

  const ownerData = {
    firstName: 'John',
    lastName: 'Doe',
    dni: String(Date.now()),
    phone: '123-456-7890',
    whatsapp: '123-456-7890',
    email: 'john.doe@example.com'
  };

  const businessData = {
    name: `Test Business ${Date.now()}`,
    dni: Date.now(),
    email: 'test@business.com',
    establishmentDate: '2020-01-01',
    expirationDate: '2030-01-01',
    boardExpirationDate: '2025-01-01',
    economicActivity: 'Salud'
  };

  const branchOfficesData = [
    {
      zone: 'CENTRO',
      address: '123 Main St',
      dimensions: '39',
      origin: 'Propio',
      type: "I"
    },
    {
      zone: 'LA CAÑADA',
      address: '456 Another St',
      dimensions: '60',
      origin: 'Alquilado',
      type: "II"
    }
  ];

  it('Should register a new business', () => {

    // Visit the business registration page
    cy.visit('http://localhost:5173/business/new');

    // Fill the business name input
    cy.get('[data-test="business-name-input"]').type(businessData.name);
    cy.get('[data-test="business-dni-input"]').type(businessData.dni);
    //cy.get('[data-test="business-email-input"]').type(businessData.email);
    cy.get('[data-test="business-incorporation-date-input"]').type(`${businessData.establishmentDate}`);
    cy.get('[data-test="business-expiration-date-input"]').type(`${businessData.boardExpirationDate}`);
    cy.get('[data-test="business-board-expiration-date-input"]').type(`${businessData.expirationDate}`);

    cy.get('[data-test="business-economic-activity-input"]').type(`${businessData.economicActivity}{enter}`);

    // // Fill the other necessary fields (adjust the selectors as needed)
    // cy.get('[data-test="business-email-input"]').type('test@business.com');
    // cy.get('[data-test="business-establishment-date-input"]').type('2020-01-01');
    // cy.get('[data-test="business-expiration-date-input"]').type('2030-01-01');
    // cy.get('[data-test="business-board-expiration-date-input"]').type('2025-01-01');

    // // Submit the form (adjust the selector to match your submit button)
    // cy.get('[data-test="business-submit-button"]').click();

    // // Verify that the business was successfully registered
    // cy.url().should('include', '/business/success'); // Adjust as needed for your success URL
    // cy.contains('Business successfully registered').should('be.visible'); // Adjust as needed for your success message


    cy.get('[data-test="owner-first-name-input"]').type(ownerData.firstName);
    cy.get('[data-test="owner-last-name-input"]').type(ownerData.lastName);
    cy.get('[data-test="owner-dni-input"]').type(ownerData.dni);
    cy.get('[data-test="owner-phone-input"]').type(ownerData.phone);
    cy.get('[data-test="owner-whatsapp-input"]').type(ownerData.whatsapp);
    cy.get('[data-test="owner-email-input"]').type(ownerData.email);


    // fill the branch offices 

    // they follow the following sequense 
    // first sucursal zone = data-test=branch-office-${index}-zone
    // the same with address, dimensions and origin (rented and owned)
    branchOfficesData.forEach((branchOffice, index) => {
      if (index !== 0) {
        cy.get("[data-test='branch-office-add-button']").click()
      }
      cy.get(`[data-test="branch-office-${index}-zone"]`).type(`${branchOffice.zone}{enter}`);
      cy.get(`[data-test="branch-office-${index}-address"]`).type(`${branchOffice.address}`);
      cy.get(`[data-test="branch-office-${index}-dimensions"]`).type(`${branchOffice.dimensions}`);
      cy.get(`[data-test="branch-office-${index}-origin"]`).type(`${branchOffice.origin}{enter}`);
    });

    cy.get('[data-test="submit-button"]').click()

    cy.contains('Contribuyente guardado exitosamente').should('be.visible'); 
  });

  // NEW TEST
  // I need to check if the business information exists 
  // i need to navigate to the business list page
    // the business should be there, get a link with the business name, and click it
    // it should navigate to the business detailed view page
    // the url should contain /business
    // the business name should be visible 
    // the url should be visible 
    // the economic activity should be visible 
    // the owner first name, last name, phone number, whatsapp and email should be visible too

    // the branch office zone, address, dimensions, type and origin should be visible too.
    it('should check if the business information exists', () => {
      // Navigate to the business list page
      cy.visit('http://localhost:5173/business');

      // Find the business in the list and click the link
      cy.contains(businessData.name).click();

      // Ensure the URL contains /business
      cy.url().should('include', '/business');

      // Check the business name is visible
      cy.contains(businessData.name).should('be.visible');

      // Check the business DNI is visible
      cy.contains(businessData.dni).should('be.visible');

      // Check the economic activity is visible
      cy.contains(businessData.economicActivity).should('be.visible');

      // Check the owner's information is visible
      cy.contains(ownerData.firstName).should('be.visible');
      cy.contains(ownerData.lastName).should('be.visible');
      cy.contains(ownerData.phone).should('be.visible');
      cy.contains(ownerData.whatsapp).should('be.visible');
      cy.contains(ownerData.email).should('be.visible');

      // Check the branch office information is visible
      const branchOffice = branchOfficesData[0];
      cy.contains(branchOffice.zone).should('be.visible');
      cy.contains(branchOffice.address).should('be.visible');
      cy.contains(branchOffice.dimensions).should('be.visible');
      cy.contains(branchOffice.type).should('be.visible');
      cy.contains(branchOffice.origin).should('be.visible');
    });

    it('should delete the business', () => {
      cy.visit(`${Cypress.config().baseUrl}/business`);
      // Find the business in the list and click the link
      cy.contains(businessData.name).click();

      // Now, delete the business
      cy.get('[data-test="business-delete-button"]').click();

      // Confirm deletion in the modal
      cy.get('[data-test="business-delete-modal"]').within(() => {
          cy.contains('Aceptar').click();
      });

      // Check that the URL is exactly /business
      cy.url().should('eq', `${Cypress.config().baseUrl}/business`);

      // Check that the business name is not visible (it is deleted)
      cy.contains(businessData.name).should('not.exist');
    })
})