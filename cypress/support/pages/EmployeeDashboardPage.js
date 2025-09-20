class EmployeeDashboardPage {
  // Main Dashboard Elements
  getPageTitle() {
    return cy.get('.navbar-brand');
  }

  getLogOutButton() {
    return cy.get('.nav-item a');
  }

  getAddEmployeeButton() {
    return cy.get('#add');
  }

  // Employee Table Elements
  getEmployeesTable() {
    return cy.get('#employeesTable');
  }

  getTableHeaders() {
    return cy.get('#employeesTable th');
  }

  getTableRows() {
    return cy.get('#employeesTable tr');
  }

  getTableCells() {
    return cy.get('#employeesTable td');
  }

  getEditButtons() {
    return cy.get('.fa-edit');
  }

  getDeleteButtons() {
    return cy.get('.fa-times');
  }

  getEditButtonByRow(rowIndex) {
    return cy.get('#employeesTable tr').eq(rowIndex).find('.fa-edit');
  }

  getDeleteButtonByRow(rowIndex) {
    return cy.get('#employeesTable tr').eq(rowIndex).find('.fa-times');
  }

  // Add/Edit Employee Modal Elements
  getEmployeeModal() {
    return cy.get('#employeeModal');
  }

  getModalTitle() {
    return cy.get('#employeeModal .modal-title');
  }

  getFirstNameInput() {
    return cy.get('#firstName');
  }

  getLastNameInput() {
    return cy.get('#lastName');
  }

  getDependentsInput() {
    return cy.get('#dependants');
  }

  getAddEmployeeSubmitButton() {
    return cy.get('#addEmployee');
  }

  getUpdateEmployeeSubmitButton() {
    return cy.get('#updateEmployee');
  }

  getModalCancelButton() {
    return cy.get('#addEmployee button').contains('Cancel');
  }

  getModalCloseButton() {
    return cy.get('#employeeModal .close');
  }

  // Delete Confirmation Modal Elements
  getDeleteModal() {
    return cy.get('#deleteModal');
  }

  getDeleteModalTitle() {
    return cy.get('#deleteModal .modal-title');
  }

  getDeleteFirstNameSpan() {
    return cy.get('#deleteFirstName');
  }

  getDeleteLastNameSpan() {
    return cy.get('#deleteLastName');
  }

  getDeleteEmployeeButton() {
    return cy.get('#deleteEmployee');
  }

  getDeleteCancelButton() {
    return cy.get('#deleteModal button').contains('Cancel');
  }

  getDeleteIdHiddenInput() {
    return cy.get('#deleteId');
  }

  getRowByUserId(userId) {
    return cy.get('#employeesTable tr').contains('td', userId).parent('tr');
  }

  getEditButtonByUserId(userId) {
    return this.getRowByUserId(userId).find('.fa-edit');
  }

  getDeleteButtonByUserId(userId) {
    return this.getRowByUserId(userId).find('.fa-times');
  }

  // Helper Methods
  clickAddEmployee() {
    this.getAddEmployeeButton().click();
  }

  clickLogOut() {
    this.getLogOutButton().click();
  }

  fillEmployeeForm(firstName, lastName, dependents) {
    this.getFirstNameInput().clear().type(firstName);
    this.getLastNameInput().clear().type(lastName);
    this.getDependentsInput().clear().type(dependents.toString());
  }

  submitAddEmployee() {
    this.getAddEmployeeSubmitButton().click();
  }

  submitUpdateEmployee() {
    this.getUpdateEmployeeSubmitButton().click();
  }

  cancelModal() {
    this.getModalCancelButton().click();
  }

  closeModal() {
    this.getModalCloseButton().click();
  }

  confirmDelete() {
    this.getDeleteEmployeeButton().click();
  }

  cancelDelete() {
    this.getDeleteCancelButton().click();
  }

  // Verification Methods
  verifyPageLoaded() {
    this.getPageTitle().should('be.visible');
    this.getEmployeesTable().should('be.visible');
    this.getAddEmployeeButton().should('be.visible');
  }

  verifyEmployeeInTable(firstName, lastName, dependents) {
    this.getEmployeesTable().should('contain', firstName);
    this.getEmployeesTable().should('contain', lastName);
    this.getEmployeesTable().should('contain', dependents);
  }

  verifyModalTitle(expectedTitle) {
    this.getModalTitle().should('have.text', expectedTitle);
  }

  verifyDeleteModalContent(firstName, lastName) {
    this.getDeleteFirstNameSpan().should('have.text', firstName);
    this.getDeleteLastNameSpan().should('have.text', lastName);
  }

  // Verification methods for specific user
  verifyEmployeeInTableByUserId(userId, firstName, lastName, dependents) {
    this.getRowByUserId(userId).within(() => {
      cy.contains(firstName).should('be.visible');
      cy.contains(lastName).should('be.visible');
      cy.contains(dependents.toString()).should('be.visible');
    });
  }

  verifyBenefitCalculationsByUserId(userId, expectedGross, expectedBenefits, expectedNet) {
    this.getRowByUserId(userId).within(() => {
      cy.contains(expectedGross).should('be.visible');
      cy.contains(expectedBenefits).should('be.visible');
      cy.contains(expectedNet).should('be.visible');
    });
  }

  // Method to get specific cell values from a user's row
  getUserRowData(userId) {
    return this.getRowByUserId(userId).within(() => {
      return {
        firstName: cy.get('td').eq(2), // Adjust index based on table structure
        lastName: cy.get('td').eq(1),
        dependents: cy.get('td').eq(3),
        salary: cy.get('td').eq(4),
        grossPay: cy.get('td').eq(5),
        benefitsCost: cy.get('td').eq(6),
        netPay: cy.get('td').eq(7)
      };
    });
  }
}

export default EmployeeDashboardPage;