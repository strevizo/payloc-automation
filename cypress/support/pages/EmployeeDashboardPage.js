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
}

export default EmployeeDashboardPage;