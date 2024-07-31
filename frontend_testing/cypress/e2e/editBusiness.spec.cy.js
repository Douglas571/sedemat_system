describe('SEDEMAT edit workflow', () => {

  function createTheBusiness(business){
    /**
     * upload the information to the api 
     * get the id
     * navigate to the busines in that id 
    

    upload this to the 
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
      economicActivity: 1,

      preferredContact: "OWNER",
      preferredChanel: "PHONE",
      sendCalculosTo: "EMAIL",
      reminderInterval: 3
    };

    const branchOfficesData = [
    {
      zone: 'CENTRO',
      address: '123 Main St',
      dimensions: 39,
      origin: "OWN",
      type: "I"
    },
    {
      zone: 'LA CAÑADA',
      address: '456 Another St',
      dimensions: 60,
      origin: "RENTED",
      type: "II"
    }
  ];

     */
  }

  const businessId = 1
  const newBusinessData = {

  }

  it('Edit business', () => {
    cy.visit('/business/edit/' + businessId);

    cy.wait(1000)

    // Edit the business name
    cy.get('[data-test="business-name-input"]').clear().type('New Business Name');

    // Type a new DNI
    cy.get('[data-test="business-dni-input"]').clear().type('NewDNI');

    // Type a new type of business ("Especial") and press enter
    cy.get('#type').type('Especial{enter}', {force: true});

    // Type a new business constitution date
    cy.get('input#companyIncorporationDate').clear().type('2024-01-01');

    // Type a new company expiration date and press enter
    cy.get('input#companyExpirationDate').clear().type('2025-01-01');

    // Type a new directors board expiration date and press enter
    cy.get('input#directorsBoardExpirationDate').clear().type('2026-01-01');
    
    // Select a new economic activity 
    // Type Construcción and press enter
    cy.get('input#economicActivity').clear({force: true}).type('Construcción{enter}');

    // Select a new preferred contact
    // Type Contador
    cy.get('input#preferredContact').clear({force: true}).type('Contador{enter}');

    // Select a new preferred communication channel
    // Type Whatsapp and press enter
    cy.get('input#preferredChannel').clear({force: true}).type('Whatsapp{enter}');

    // Set a sendCalculosTo
    cy.get('input#sendCalculosTo').clear({force: true}).type('Correo{enter}');

    // Set reminder interval to 
    // Type Cada 7 días and press enter
    cy.get('input#reminderInterval').clear({force: true}).type('Cada 7 días{enter}');

    // Set information for the accountant
    // Type first name
    cy.get('[data-test="accountant-first-name"]').clear().type('AccountantFirstName');
    
    // Type second name
    cy.get('[data-test="accountant-second-name"]').clear().type('AccountantSecondName');
    
    // Type DNI
    cy.get('[data-test="accountant-dni"]').clear().type('AccountantDNI');
    
    // Type phone
    cy.get('[data-test="accountant-phone"]').clear().type('1234567890');
    
    // Type Whatsapp
    cy.get('[data-test="accountant-whatsapp"]').clear().type('1234567890');
    
    // Type email
    cy.get('[data-test="accountant-email"]').clear().type('accountant@example.com');

    cy.get('[data-test="button-add-branch-office"]').click()
});
})