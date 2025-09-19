Cypress.Commands.add('loginSession', () => {
  cy.session('userLogin', () => {
    cy.visit(Cypress.env('LOGIN_URL'));
    
    // Verify login page elements
    cy.get('.navbar-brand').should('contain', 'Paylocity Benefits Dashboard');
    cy.get('#Username').type(Cypress.env('USERNAME'));
    cy.get('#Password').type(Cypress.env('PASSWORD'));
    cy.get('button[type="submit"]').click();
    
    // Verify successful login by checking redirect to dashboard
    cy.url().should('include', '/Benefits');
    cy.get('.navbar-brand').should('be.visible');
  });
});