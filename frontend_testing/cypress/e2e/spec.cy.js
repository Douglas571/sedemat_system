describe('SEDEMAT basic workflow', () => {
  beforeEach(() => {
    // Cypress starts out with a blank slate for each test
    // so we must tell it to visit our website with the `cy.visit()` command.
    // Since we want to visit the same URL at the start of all our tests,
    // we include it in our beforeEach function so that it runs before each test
      cy.visit('http://localhost:5173/')
  })

  const ownerData = {
    firstName: 'John',
    lastName: 'Doe',
    dni: String(Date.now()),
    phone: '123-456-7890',
    whatsapp: '123-456-7890',
    email: 'john.doe@example.com',
    pfpPath: './cypress/e2e/test-pfp.png'
  };

  const accountantData = {
    firstName: 'Jane',
    lastName: 'Smith',
    dni: String(Date.now() + 1), // Ensuring a unique value
    phone: '987-654-3210',
    whatsapp: '987-654-3210',
    email: 'jane.smith@example.com'
  };
  
  const administratorData = {
    firstName: 'Alice',
    lastName: 'Johnson',
    dni: String(Date.now() + 2), // Ensuring a unique value
    phone: '555-555-5555',
    whatsapp: '555-555-5555',
    email: 'alice.johnson@example.com'
  };

  const businessData = {
    name: `Test Business ${Date.now()}`,
    dni: Date.now(),
    email: 'test@business.com',
    establishmentDate: '2020-01-01',
    expirationDate: '2030-01-01',
    boardExpirationDate: '2025-01-01',
    economicActivity: 'Salud',

    preferredContact: "Propietario",
    preferredChannel: "Teléfono",
    sendCalculosTo: "Correo",
    reminderInterval: "Cada 3 días"
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

    // Fill the business basic information
    cy.get('[data-test="business-name-input"]').type(businessData.name);
    cy.get('[data-test="business-dni-input"]').type(businessData.dni);
    cy.get('[data-test="business-incorporation-date-input"]').type(`${businessData.establishmentDate}`);
    cy.get('[data-test="business-expiration-date-input"]').type(`${businessData.boardExpirationDate}`);
    cy.get('[data-test="business-board-expiration-date-input"]').type(`${businessData.expirationDate}`);

    cy.get('[data-test="business-economic-activity-input"]').type(`${businessData.economicActivity}{enter}`);

    // fill preferred communication channel information
    cy.get('[data-test="communication-options-preferred-contact"]').type(`${businessData.preferredContact.slice(4)[0]}{enter}`);
    cy.get('[data-test="communication-options-preferred-channel"]').type(`${businessData.preferredChannel}{enter}`);
    cy.get('[data-test="communication-options-send-calculos"]').type(`${businessData.sendCalculosTo}{enter}`);
    cy.get('[data-test="communication-options-reminder-interval"]').type(`${businessData.reminderInterval.slice(5)[0]}{enter}`);

    // fill owner information 
    cy.get('[data-test="owner-first-name-input"]').type(ownerData.firstName);
    cy.get('[data-test="owner-last-name-input"]').type(ownerData.lastName);
    cy.get('[data-test="owner-dni-input"]').type(ownerData.dni);
    cy.get('[data-test="owner-phone-input"]').type(ownerData.phone);
    cy.get('[data-test="owner-whatsapp-input"]').type(ownerData.whatsapp);
    cy.get('[data-test="owner-email-input"]').type(ownerData.email);

    cy.get('[data-test="business-new-owner-pfp"]').selectFile(ownerData.pfpPath, {force: true})

    // fill accountant information 
    cy.get('[data-test="accountant-first-name-input"]').type(accountantData.firstName);
    cy.get('[data-test="accountant-last-name-input"]').type(accountantData.lastName);
    cy.get('[data-test="accountant-dni-input"]').type(accountantData.dni);
    cy.get('[data-test="accountant-phone-input"]').type(accountantData.phone);
    cy.get('[data-test="accountant-whatsapp-input"]').type(accountantData.whatsapp);
    cy.get('[data-test="accountant-email-input"]').type(accountantData.email);

    cy.get('[data-test="administrator-first-name-input"]').type(administratorData.firstName);
    cy.get('[data-test="administrator-last-name-input"]').type(administratorData.lastName);
    cy.get('[data-test="administrator-dni-input"]').type(administratorData.dni);
    cy.get('[data-test="administrator-phone-input"]').type(administratorData.phone);
    cy.get('[data-test="administrator-whatsapp-input"]').type(administratorData.whatsapp);
    cy.get('[data-test="administrator-email-input"]').type(administratorData.email);

    // fill branch office data
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


  it('Should edit an existing business', () => {
    // Navigate to the business list page
    cy.visit('http://localhost:5173/business');
  
    // Find the business in the list and click the link
    cy.contains(businessData.name).click();
  
    // Click the edit button
    cy.get('[data-test="business-edit-button"]').click();
    
    cy.wait(1000)
  
    // Define new business data with some changes
    const newBusinessData = {
      //...businessData,
      name: `Updated Business ${Date.now()}`, // Change the name
      expirationDate: '2040-01-01', // Change the expiration date
      preferredContact: "Contador", // Change the preferred contact
      preferredChannel: "Correo", // Change the preferred channel,
    };

    const newOwnerData = {
      email: 'updated@business.com',
      pfpPath: "./cypress/e2e/test-pfp.jpg"
    }
  
    // Fill the business basic information with new data
    cy.get('[data-test="business-name-input"]').clear({force: true}).type(newBusinessData.name, {force: true});
    // cy.get('[data-test="business-email-input"]').clear({force: true}).type(newBusinessData.email, {force: true});
    cy.get('[data-test="business-expiration-date-input"]').clear({force: true}).type(`${newBusinessData.expirationDate}{enter}`);
  
    // Fill preferred communication channel information with new data
    cy.log(
      [newBusinessData.preferredContact, newBusinessData.preferredChannel]
    )
    // cy.get('[data-test="communication-options-preferred-contact"] input').clear({force: true})
    cy.get('[data-test="communication-options-preferred-contact"]').click().type(`${newBusinessData.preferredContact}{enter}`);
    // cy.get('[data-test="communication-options-preferred-channel"] input').clear({force: true})
    cy.get('[data-test="communication-options-preferred-channel"]').click().type(`${newBusinessData.preferredChannel}{enter}`);
  
    // Optionally, modify the file by uncommenting the line below
    cy.get('[data-test="business-new-owner-pfp"]').selectFile(newOwnerData.pfpPath, {force: true});
  
    // Submit the form
    cy.get('[data-test="submit-button"]').click();
  
    // Check for a success message
    cy.contains('Contribuyente actualizado exitosamente').should('be.visible');
  
    // Verify the updated business information
    cy.visit('http://localhost:5173/business');
    cy.contains(newBusinessData.name).click();
  
    cy.url().should('include', '/business');
    cy.contains(newBusinessData.name).should('be.visible');
    // cy.contains(newOwner.email).should('be.visible');
    cy.contains(newBusinessData.expirationDate).should('be.visible');
    cy.get('[data-test="communication-options-preferred-contact"]').contains(newBusinessData.preferredContact).should('be.visible');
    cy.get('[data-test="communication-options-preferred-channel"]').contains(newBusinessData.preferredChannel).should('be.visible');
    
    cy.get('[data-test="business-details-owner-pfp"] img')
      .should('have.attr', 'src')
      .and('not.be.empty')
      .and('not.include', 'null');

    businessData.name = newBusinessData.name
  });

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

      cy.get('[data-test="business-details-owner-pfp"] img')
        .should('have.attr', 'src')
        .and('not.be.empty')
        .and('not.include', 'null');

      // Check the accountant's information is visible
      cy.contains(accountantData.firstName).should('be.visible');
      cy.contains(accountantData.lastName).should('be.visible');
      cy.contains(accountantData.phone).should('be.visible');
      cy.contains(accountantData.whatsapp).should('be.visible');
      cy.contains(accountantData.email).should('be.visible');

      // Check the administrator's information is visible
      cy.contains(administratorData.firstName).should('be.visible');
      cy.contains(administratorData.lastName).should('be.visible');
      cy.contains(administratorData.phone).should('be.visible');
      cy.contains(administratorData.whatsapp).should('be.visible');
      cy.contains(administratorData.email).should('be.visible');

      // Check the branch office information is visible
      const branchOffice = branchOfficesData[0];
      cy.contains(branchOffice.zone).should('be.visible');
      cy.contains(branchOffice.address).should('be.visible');
      cy.contains(branchOffice.dimensions).should('be.visible');
      cy.contains(branchOffice.type).should('be.visible');
      cy.contains(branchOffice.origin).should('be.visible');

      cy.get('[data-test="communication-options-preferred-contact"]').contains(businessData.preferredContact);
      cy.get('[data-test="communication-options-preferred-channel"]').contains(ownerData.whatsapp);
      cy.get('[data-test="communication-options-preferred-channel"]').contains(businessData.preferredChannel);
      cy.get('[data-test="communication-options-send-calculos"]').contains(ownerData.email);
      cy.get('[data-test="communication-options-reminder-interval"]').contains(businessData.reminderInterval);
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