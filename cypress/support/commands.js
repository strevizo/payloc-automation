import LoginPage from './pages/LoginPage';
import EmployeeDashboardPage from './pages/EmployeeDashboardPage';

Cypress.Commands.add('loginSession', () => {
  cy.session('userLogin', () => {
    const loginPage = new LoginPage();
    const dashboardPage = new EmployeeDashboardPage();
    
    // Set up intercept to monitor session establishment
    cy.intercept('GET', '**/api/employees').as('getEmployees');
    
    cy.visit(Cypress.env('LOGIN_URL'));
    
    // Verify login page elements using POM
    loginPage.verifyLoginPageLoaded();
    
    // Perform login using POM methods
    loginPage.login(Cypress.env('USERNAME'), Cypress.env('PASSWORD'));
    
    // Verify successful login by checking redirect to dashboard
    loginPage.verifyRedirectToDashboard();
    
    // CRITICAL: Verify session is properly established with API access
    cy.wait('@getEmployees', { timeout: 15000 }).then((interception) => {
      if (interception.response.statusCode !== 200) {
        // Session establishment failed - no point continuing
        throw new Error(`SESSION ESTABLISHMENT FAILED: API returned ${interception.response.statusCode} instead of 200. Session management is broken.`);
      }
      
      cy.log(' Session successfully established - API access confirmed');
    });
    
    // Additional verification that we're properly logged in using POM
    dashboardPage.getPageTitle().should('be.visible');
  });
});