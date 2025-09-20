class LoginPage {
  // Navigation Elements
  getPageTitle() {
    return cy.get('.navbar-brand');
  }

  // Login Form Elements
  getUsernameInput() {
    return cy.get('#Username');
  }

  getPasswordInput() {
    return cy.get('#Password');
  }

  getLoginButton() {
    return cy.get('button[type="submit"]');
  }

  getValidationSummary() {
    return cy.get('.text-danger.validation-summary-valid');
  }

  getValidationErrors() {
    return cy.get('.text-danger.validation-summary-errors');
  }

  getValidationErrorSpan() {
    return cy.get('.text-danger.validation-summary-errors span');
  }

  getValidationErrorList() {
    return cy.get('.text-danger.validation-summary-errors ul');
  }

  getValidationErrorItems() {
    return cy.get('.text-danger.validation-summary-errors ul li');
  }

  getCsrfToken() {
    return cy.get('input[name="__RequestVerificationToken"]');
  }

  getPaylocityLogo() {
    return cy.get('img[alt="Paylocity"]');
  }

  // Footer Elements
  getFooter() {
    return cy.get('footer .container');
  }

  // Helper Methods
  fillLoginForm(username, password) {
    this.getUsernameInput().clear().type(username);
    this.getPasswordInput().clear().type(password);
  }

  submitLogin() {
    this.getLoginButton().click();
  }

  login(username, password) {
    this.fillLoginForm(username, password);
    this.submitLogin();
  }

  // Verification Methods
  verifyLoginPageLoaded() {
    this.getPageTitle().should('be.visible').should('contain', 'Paylocity Benefits Dashboard');
    this.getUsernameInput().should('be.visible');
    this.getPasswordInput().should('be.visible');
    this.getLoginButton().should('be.visible');
  }

  verifyPageTitleLink() {
    this.getPageTitle()
      .should('have.attr', 'href', '/Prod/Benefits')
      .should('contain', 'Paylocity Benefits Dashboard');
  }

  verifyFooterContent() {
    this.getFooter()
      .should('be.visible')
      .should('contain', '© 2025 - Paylocity');
  }

  verifyPaylocityLogo() {
    this.getPaylocityLogo().should('be.visible');
  }

  verifyLoginButtonText() {
    this.getLoginButton().should('contain', 'Log In');
  }

  verifyCsrfTokenDoesNotExist() {
    this.getCsrfToken()
      .should('exist')
      .should('have.attr', 'type', 'hidden')
      .invoke('val')
      .should('be.empty');
  }

  verifyValidationSummaryExists() {
    this.getValidationSummary().should('exist');
  }

  verifyStayOnLoginPage() {
    cy.url().should('include', 'Login');
  }

  verifyRedirectToDashboard() {
    cy.url().should('include', '/Benefits');
  }

  // Verification methods
  verifyValidationErrorsVisible() {
    this.getValidationErrors().should('be.visible');
  }

  verifyValidationErrorHeader() {
    this.getValidationErrorSpan()
      .should('be.visible')
      .should('have.text', 'There were one or more problems that prevented you from logging in:');
  }

  verifyValidationErrorsStructure() {
    this.verifyValidationErrorsVisible();
    this.verifyValidationErrorHeader();
    this.getValidationErrorList().should('be.visible');
  }

  verifySpecificValidationError(errorText) {
    this.getValidationErrorItems().should('contain', errorText);
  }

  verifyUsernameRequiredError() {
    this.verifyValidationErrorsStructure();
    this.verifySpecificValidationError('The Username field is required.');
  }

  verifyPasswordRequiredError() {
    this.verifyValidationErrorsStructure();
    this.verifySpecificValidationError('The Password field is required.');
  }

  verifyBothFieldsRequiredErrors() {
    this.verifyValidationErrorsStructure();
    this.verifySpecificValidationError('The Username field is required.');
    this.verifySpecificValidationError('The Password field is required.');
    this.getValidationErrorItems().should('have.length', 2);
  }
}

export default LoginPage;