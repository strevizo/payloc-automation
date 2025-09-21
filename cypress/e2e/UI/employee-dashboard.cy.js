import EmployeeDashboardPage from '../../support/pages/EmployeeDashboardPage';
import { deleteAutomationEmployees, createEmployee } from '../../support/api-helpers/employees';

describe('Employee Benefits Dashboard', () => {
  const dashboardPage = new EmployeeDashboardPage();
  const apiUrl = Cypress.env('API_URL');

  // Constants based on rules, using .env for easy updates
  const paychecksPerYear = Cypress.env('PAY_PERIODS_PER_YEAR');
  const employeeBenefitsPerYear = Cypress.env('EMPLOYEE_BENEFIT_COST');
  const dependantBenefitsPerYear = Cypress.env('DEPENDANT_BENEFIT_COST');

  before('Setup session and intercepts', () => {
    cy.loginSession();
    // cleanupTestEmployees(); // Commented out for now
  });

  beforeEach(() => {
    cy.loginSession();
    cy.visit(Cypress.env('BASE_URL'));
    dashboardPage.verifyPageLoaded();

    // Set up intercepts for all tests
    cy.intercept('POST', '**/api/employees').as('createEmployee');
    cy.intercept('PUT', '**/api/employees').as('updateEmployee');
    cy.intercept('DELETE', '**/api/employees/*').as('deleteEmployee');
    cy.intercept('GET', '**/api/employees').as('getEmployees');
  });

  describe('User Story 1: Add Employee', () => {
    it('should allow employer to add employee and calculate benefits correctly', () => {
      const employee = {
        firstName: 'Cypress',
        lastName: 'TestUser',
        dependents: 2
      };

      // GIVEN an Employer AND I am on the Benefits Dashboard page
      dashboardPage.verifyPageLoaded();

      // WHEN I select Add Employee
      dashboardPage.clickAddEmployee();
      dashboardPage.getEmployeeModal().should('be.visible');

      // THEN I should be able to enter employee details
      dashboardPage.fillEmployeeForm(employee.firstName, employee.lastName, employee.dependents);

      // AND the employee should save
      dashboardPage.submitAddEmployee();

      // Wait for API response and get userId
      cy.wait('@createEmployee').then((interception) => {
        expect(interception.response.statusCode).to.eq(200);
        const userId = interception.response.body.id;
        const employeeSalary = interception.response.body.salary;

        dashboardPage.getEmployeeModal().should('not.be.visible');

        // AND I should see the employee in the table
        dashboardPage.verifyEmployeeInTableByUserId(userId, employee.firstName, employee.lastName, employee.dependents);

        // AND the benefit cost calculations are correct
        // Calculate using environment variables
        const employeeBenefitsPerPaycheck = employeeBenefitsPerYear / paychecksPerYear;
        const grossPerPaycheck = employeeSalary / paychecksPerYear;
        const dependantBenefitsPerPaycheck = (dependantBenefitsPerYear * employee.dependents) / paychecksPerYear;
        const totalBenefitsPerPaycheck = Number((employeeBenefitsPerPaycheck + dependantBenefitsPerPaycheck).toFixed(5));

        // Calculate net with rounding rules: Math.ceil to round UP
        const netPay = Math.ceil((grossPerPaycheck - totalBenefitsPerPaycheck) * 10000) / 10000;

        // Format for comparison (4 decimal places)
        const expectedGross = grossPerPaycheck.toFixed(2);
        const expectedBenefits = totalBenefitsPerPaycheck.toFixed(2);
        const expectedNet = netPay.toFixed(2);

        dashboardPage.verifyBenefitCalculationsByUserId(userId, expectedGross, expectedBenefits, expectedNet);
      });
    });

    it('should calculate benefits correctly for employee with no dependents', () => {
      const employee = {
        firstName: 'Cypress',
        lastName: 'NoDependents',
        dependents: 0
      };

      dashboardPage.clickAddEmployee();
      dashboardPage.fillEmployeeForm(employee.firstName, employee.lastName, employee.dependents);
      dashboardPage.submitAddEmployee();

      cy.wait('@createEmployee').then((interception) => {
        expect(interception.response.statusCode).to.eq(200);
        const userId = interception.response.body.id;
        const employeeSalary = interception.response.body.salary;

        // Calculate benefits for employee only (no dependents)
        const employeeBenefitsPerPaycheck = employeeBenefitsPerYear / paychecksPerYear;
        const grossPerPaycheck = employeeSalary / paychecksPerYear;
        const totalBenefitsPerPaycheck = Number(employeeBenefitsPerPaycheck.toFixed(5));

        // Calculate net with rounding rules
        const netPay = Math.ceil((grossPerPaycheck - totalBenefitsPerPaycheck) * 10000) / 10000;

        const expectedGross = grossPerPaycheck.toFixed(2);
        const expectedBenefits = totalBenefitsPerPaycheck.toFixed(2);
        const expectedNet = netPay.toFixed(2);

        dashboardPage.verifyEmployeeInTableByUserId(userId, employee.firstName, employee.lastName, employee.dependents);
        dashboardPage.verifyBenefitCalculationsByUserId(userId, expectedGross, expectedBenefits, expectedNet);
      });
    });

    it('should calculate benefits correctly for employee with maximum dependents', () => {
      const employee = {
        firstName: 'Cypress',
        lastName: 'MaxDependents',
        dependents: 32 // Maximum from schema
      };

      dashboardPage.clickAddEmployee();
      dashboardPage.fillEmployeeForm(employee.firstName, employee.lastName, employee.dependents);
      dashboardPage.submitAddEmployee();

      cy.wait('@createEmployee').then((interception) => {
        expect(interception.response.statusCode).to.eq(200);
        const userId = interception.response.body.id;
        const employeeSalary = interception.response.body.salary;

        // Calculate benefits for employee + 32 dependents
        const employeeBenefitsPerPaycheck = employeeBenefitsPerYear / paychecksPerYear;
        const grossPerPaycheck = employeeSalary / paychecksPerYear;
        const dependantBenefitsPerPaycheck = (dependantBenefitsPerYear * employee.dependents) / paychecksPerYear;
        const totalBenefitsPerPaycheck = Number((employeeBenefitsPerPaycheck + dependantBenefitsPerPaycheck).toFixed(5));

        // Calculate net with rounding rules
        const netPay = Math.ceil((grossPerPaycheck - totalBenefitsPerPaycheck) * 10000) / 10000;

        const expectedGross = grossPerPaycheck.toFixed(2);
        const expectedBenefits = totalBenefitsPerPaycheck.toFixed(2);
        const expectedNet = netPay.toFixed(2);

        dashboardPage.verifyEmployeeInTableByUserId(userId, employee.firstName, employee.lastName, employee.dependents);
        dashboardPage.verifyBenefitCalculationsByUserId(userId, expectedGross, expectedBenefits, expectedNet);
      });
    });
  });

  describe('User Story 2: Edit Employee', () => {
    it('should allow employer to edit employee details', () => {
      // Create employee first
      const originalEmployee = {
        firstName: 'Cypress',
        lastName: 'ToEdit',
        dependents: 1
      };

      dashboardPage.clickAddEmployee();
      dashboardPage.fillEmployeeForm(originalEmployee.firstName, originalEmployee.lastName, originalEmployee.dependents);
      dashboardPage.submitAddEmployee();

      cy.wait('@createEmployee').then((interception) => {
        expect(interception.response.statusCode).to.eq(200);
        const userId = interception.response.body.id;

        // Verify employee was created
        dashboardPage.verifyEmployeeInTableByUserId(userId, originalEmployee.firstName, originalEmployee.lastName, originalEmployee.dependents);

        // GIVEN an Employer AND I am on the Benefits Dashboard page
        dashboardPage.verifyPageLoaded();

        // WHEN I select the Action Edit for this specific employee
        dashboardPage.getEditButtonByUserId(userId).click();
        dashboardPage.getEmployeeModal().should('be.visible');

        // THEN I can edit employee details
        const updatedEmployee = {
          firstName: 'Cypress',
          lastName: 'Updated',
          dependents: 3
        };

        dashboardPage.fillEmployeeForm(updatedEmployee.firstName, updatedEmployee.lastName, updatedEmployee.dependents);
        dashboardPage.submitUpdateEmployee();

        // Wait for update API call
        cy.wait('@updateEmployee').then((updateInterception) => {
          expect(updateInterception.response.statusCode).to.eq(200);
          const employeeSalary = updateInterception.response.body.salary;

          dashboardPage.getEmployeeModal().should('not.be.visible');

          // AND the data should change in the table
          dashboardPage.verifyEmployeeInTableByUserId(userId, updatedEmployee.firstName, updatedEmployee.lastName, updatedEmployee.dependents);

          // Verify updated benefit calculations using environment variables
          const employeeBenefitsPerPaycheck = employeeBenefitsPerYear / paychecksPerYear;
          const grossPerPaycheck = employeeSalary / paychecksPerYear;
          const dependantBenefitsPerPaycheck = (dependantBenefitsPerYear * updatedEmployee.dependents) / paychecksPerYear;
          const totalBenefitsPerPaycheck = Number((employeeBenefitsPerPaycheck + dependantBenefitsPerPaycheck).toFixed(5));

          // Calculate net with rounding rules: Math.ceil to round UP
          const netPay = Math.ceil((grossPerPaycheck - totalBenefitsPerPaycheck) * 10000) / 10000;

          // Format for comparison (2 decimal places)
          const expectedGross = grossPerPaycheck.toFixed(2);
          const expectedBenefits = totalBenefitsPerPaycheck.toFixed(2);
          const expectedNet = netPay.toFixed(2);

          dashboardPage.verifyBenefitCalculationsByUserId(userId, expectedGross, expectedBenefits, expectedNet);
        });
      });
    });

    it('should recalculate benefits when changing from no dependents to multiple dependents', () => {
      // Create employee with no dependents first
      const originalEmployee = {
        firstName: 'Cypress',
        lastName: 'DependentsChange',
        dependents: 0
      };

      dashboardPage.clickAddEmployee();
      dashboardPage.fillEmployeeForm(originalEmployee.firstName, originalEmployee.lastName, originalEmployee.dependents);
      dashboardPage.submitAddEmployee();

      cy.wait('@createEmployee').then((interception) => {
        expect(interception.response.statusCode).to.eq(200);
        const userId = interception.response.body.id;

        // Edit to add dependents
        dashboardPage.getEditButtonByUserId(userId).click();
        dashboardPage.getEmployeeModal().should('be.visible');

        const updatedEmployee = {
          firstName: 'Cypress',
          lastName: 'DependentsChange',
          dependents: 5 // Add 5 dependents
        };

        dashboardPage.fillEmployeeForm(updatedEmployee.firstName, updatedEmployee.lastName, updatedEmployee.dependents);
        dashboardPage.submitUpdateEmployee();

        cy.wait('@updateEmployee').then((updateInterception) => {
          expect(updateInterception.response.statusCode).to.eq(200);
          const employeeSalary = updateInterception.response.body.salary;

          // Calculate new benefits with 5 dependents
          const employeeBenefitsPerPaycheck = employeeBenefitsPerYear / paychecksPerYear;
          const grossPerPaycheck = employeeSalary / paychecksPerYear;
          const dependantBenefitsPerPaycheck = (dependantBenefitsPerYear * updatedEmployee.dependents) / paychecksPerYear;
          const totalBenefitsPerPaycheck = Number((employeeBenefitsPerPaycheck + dependantBenefitsPerPaycheck).toFixed(5));

          // Calculate net with rounding rules
          const netPay = Math.ceil((grossPerPaycheck - totalBenefitsPerPaycheck) * 10000) / 10000;

          const expectedGross = grossPerPaycheck.toFixed(2);
          const expectedBenefits = totalBenefitsPerPaycheck.toFixed(2);
          const expectedNet = netPay.toFixed(2);

          dashboardPage.verifyEmployeeInTableByUserId(userId, updatedEmployee.firstName, updatedEmployee.lastName, updatedEmployee.dependents);
          dashboardPage.verifyBenefitCalculationsByUserId(userId, expectedGross, expectedBenefits, expectedNet);
        });
      });
    });

    it('should recalculate benefits when reducing dependents to zero', () => {
      // Create employee with multiple dependents first
      const originalEmployee = {
        firstName: 'Cypress',
        lastName: 'ReduceDependents',
        dependents: 10
      };

      dashboardPage.clickAddEmployee();
      dashboardPage.fillEmployeeForm(originalEmployee.firstName, originalEmployee.lastName, originalEmployee.dependents);
      dashboardPage.submitAddEmployee();

      cy.wait('@createEmployee').then((interception) => {
        expect(interception.response.statusCode).to.eq(200);
        const userId = interception.response.body.id;

        // Edit to remove all dependents
        dashboardPage.getEditButtonByUserId(userId).click();
        dashboardPage.getEmployeeModal().should('be.visible');

        const updatedEmployee = {
          firstName: 'Cypress',
          lastName: 'ReduceDependents',
          dependents: 0 // Remove all dependents
        };

        dashboardPage.fillEmployeeForm(updatedEmployee.firstName, updatedEmployee.lastName, updatedEmployee.dependents);
        dashboardPage.submitUpdateEmployee();

        cy.wait('@updateEmployee').then((updateInterception) => {
          expect(updateInterception.response.statusCode).to.eq(200);
          const employeeSalary = updateInterception.response.body.salary;

          // Calculate benefits for employee only (no dependents)
          const employeeBenefitsPerPaycheck = employeeBenefitsPerYear / paychecksPerYear;
          const grossPerPaycheck = employeeSalary / paychecksPerYear;
          const totalBenefitsPerPaycheck = Number(employeeBenefitsPerPaycheck.toFixed(5));

          // Calculate net with rounding rules
          const netPay = Math.ceil((grossPerPaycheck - totalBenefitsPerPaycheck) * 10000) / 10000;

          const expectedGross = grossPerPaycheck.toFixed(2);
          const expectedBenefits = totalBenefitsPerPaycheck.toFixed(2);
          const expectedNet = netPay.toFixed(2);

          dashboardPage.verifyEmployeeInTableByUserId(userId, updatedEmployee.firstName, updatedEmployee.lastName, updatedEmployee.dependents);
          dashboardPage.verifyBenefitCalculationsByUserId(userId, expectedGross, expectedBenefits, expectedNet);
        });
      });
    });
  });

  describe('User Story 3: Delete Employee', () => {
    it('should allow employer to delete employee', () => {
      // Create employee first
      const employee = {
        firstName: 'Cypress',
        lastName: 'ToDelete',
        dependents: 1
      };

      dashboardPage.clickAddEmployee();
      dashboardPage.fillEmployeeForm(employee.firstName, employee.lastName, employee.dependents);
      dashboardPage.submitAddEmployee();

      cy.wait('@createEmployee').then((interception) => {
        expect(interception.response.statusCode).to.eq(200);
        const userId = interception.response.body.id;
        const employeeSalary = interception.response.body.salary;

        // Calculate expected values to verify employee exists with correct data
        const employeeBenefitsPerPaycheck = employeeBenefitsPerYear / paychecksPerYear;
        const grossPerPaycheck = employeeSalary / paychecksPerYear;
        const dependantBenefitsPerPaycheck = (dependantBenefitsPerYear * employee.dependents) / paychecksPerYear;
        const totalBenefitsPerPaycheck = Number((employeeBenefitsPerPaycheck + dependantBenefitsPerPaycheck).toFixed(5));

        // Calculate net with rounding rules
        const netPay = Math.ceil((grossPerPaycheck - totalBenefitsPerPaycheck) * 10000) / 10000;

        const expectedGross = grossPerPaycheck.toFixed(2);
        const expectedBenefits = totalBenefitsPerPaycheck.toFixed(2);
        const expectedNet = netPay.toFixed(2);

        // GIVEN an Employer AND I am on the Benefits Dashboard page
        dashboardPage.verifyPageLoaded();
        dashboardPage.verifyEmployeeInTableByUserId(userId, employee.firstName, employee.lastName, employee.dependents);
        dashboardPage.verifyBenefitCalculationsByUserId(userId, expectedGross, expectedBenefits, expectedNet);

        // WHEN I click the Action X for this specific employee
        dashboardPage.getDeleteButtonByUserId(userId).click();
        dashboardPage.getDeleteModal().should('be.visible');
        dashboardPage.verifyDeleteModalContent(employee.firstName, employee.lastName);

        // THEN the employee should be deleted
        dashboardPage.confirmDelete();

        cy.wait('@deleteEmployee').then((deleteInterception) => {
          expect(deleteInterception.response.statusCode).to.eq(200);

          dashboardPage.getDeleteModal().should('not.be.visible');

          // Verify employee is removed from table by checking userId no longer exists
          cy.get('#employeesTable').should('not.contain', userId);
        });
      });
    });

    it('should show delete confirmation modal with employee details', () => {
      // Create employee first
      const employee = {
        firstName: 'Cypress',
        lastName: 'DeleteModalTest',
        dependents: 2
      };

      dashboardPage.clickAddEmployee();
      dashboardPage.fillEmployeeForm(employee.firstName, employee.lastName, employee.dependents);
      dashboardPage.submitAddEmployee();

      cy.wait('@createEmployee').then((interception) => {
        expect(interception.response.statusCode).to.eq(200);
        const userId = interception.response.body.id;
        const employeeSalary = interception.response.body.salary;

        // Verify employee exists with correct calculations before attempting delete
        const employeeBenefitsPerPaycheck = employeeBenefitsPerYear / paychecksPerYear;
        const grossPerPaycheck = employeeSalary / paychecksPerYear;
        const dependantBenefitsPerPaycheck = (dependantBenefitsPerYear * employee.dependents) / paychecksPerYear;
        const totalBenefitsPerPaycheck = Number((employeeBenefitsPerPaycheck + dependantBenefitsPerPaycheck).toFixed(5));

        // Calculate net with rounding rules
        const netPay = Math.ceil((grossPerPaycheck - totalBenefitsPerPaycheck) * 10000) / 10000;

        const expectedGross = grossPerPaycheck.toFixed(2);
        const expectedBenefits = totalBenefitsPerPaycheck.toFixed(2);
        const expectedNet = netPay.toFixed(2);

        // Verify employee data before delete
        dashboardPage.verifyEmployeeInTableByUserId(userId, employee.firstName, employee.lastName, employee.dependents);
        dashboardPage.verifyBenefitCalculationsByUserId(userId, expectedGross, expectedBenefits, expectedNet);

        // Click delete for this specific employee
        dashboardPage.getDeleteButtonByUserId(userId).click();

        // Verify delete modal appears with correct content
        dashboardPage.getDeleteModal().should('be.visible');
        dashboardPage.getDeleteModalTitle().should('contain', 'Delete Employee');
        dashboardPage.verifyDeleteModalContent(employee.firstName, employee.lastName);

        // Cancel the deletion for this test
        dashboardPage.cancelDelete();
        dashboardPage.getDeleteModal().should('not.be.visible');

        // Verify employee still exists in table with correct data
        dashboardPage.verifyEmployeeInTableByUserId(userId, employee.firstName, employee.lastName, employee.dependents);
        dashboardPage.verifyBenefitCalculationsByUserId(userId, expectedGross, expectedBenefits, expectedNet);
      });
    });

    it('should delete employee with maximum dependents and verify removal', () => {
      // Test deletion of employee with maximum dependents (edge case)
      const employee = {
        firstName: 'Cypress',
        lastName: 'MaxDependentsDelete',
        dependents: 32 // Maximum from schema
      };

      dashboardPage.clickAddEmployee();
      dashboardPage.fillEmployeeForm(employee.firstName, employee.lastName, employee.dependents);
      dashboardPage.submitAddEmployee();

      cy.wait('@createEmployee').then((interception) => {
        expect(interception.response.statusCode).to.eq(200);
        const userId = interception.response.body.id;
        const employeeSalary = interception.response.body.salary;

        // Calculate benefits for employee with maximum dependents
        const employeeBenefitsPerPaycheck = employeeBenefitsPerYear / paychecksPerYear;
        const grossPerPaycheck = employeeSalary / paychecksPerYear;
        const dependantBenefitsPerPaycheck = (dependantBenefitsPerYear * employee.dependents) / paychecksPerYear;
        const totalBenefitsPerPaycheck = Number((employeeBenefitsPerPaycheck + dependantBenefitsPerPaycheck).toFixed(5));

        // Calculate net with rounding rules
        const netPay = Math.ceil((grossPerPaycheck - totalBenefitsPerPaycheck) * 10000) / 10000;

        const expectedGross = grossPerPaycheck.toFixed(2);
        const expectedBenefits = totalBenefitsPerPaycheck.toFixed(2);
        const expectedNet = netPay.toFixed(2);

        // Verify employee exists with correct high-dependent calculations
        dashboardPage.verifyEmployeeInTableByUserId(userId, employee.firstName, employee.lastName, employee.dependents);
        dashboardPage.verifyBenefitCalculationsByUserId(userId, expectedGross, expectedBenefits, expectedNet);

        // Delete the employee
        dashboardPage.getDeleteButtonByUserId(userId).click();
        dashboardPage.getDeleteModal().should('be.visible');
        dashboardPage.confirmDelete();

        cy.wait('@deleteEmployee').then((deleteInterception) => {
          expect(deleteInterception.response.statusCode).to.eq(200);

          // Verify complete removal
          cy.get('#employeesTable').should('not.contain', userId);
          cy.get('#employeesTable').should('not.contain', 'MaxDependentsDelete');
        });
      });
    });

    it('should delete employee with no dependents and verify removal', () => {
      // Test deletion of employee with no dependents (edge case)
      const employee = {
        firstName: 'Cypress',
        lastName: 'NoDependentsDelete',
        dependents: 0
      };

      dashboardPage.clickAddEmployee();
      dashboardPage.fillEmployeeForm(employee.firstName, employee.lastName, employee.dependents);
      dashboardPage.submitAddEmployee();

      cy.wait('@createEmployee').then((interception) => {
        expect(interception.response.statusCode).to.eq(200);
        const userId = interception.response.body.id;
        const employeeSalary = interception.response.body.salary;

        // Calculate benefits for employee only (no dependents)
        const employeeBenefitsPerPaycheck = employeeBenefitsPerYear / paychecksPerYear;
        const grossPerPaycheck = employeeSalary / paychecksPerYear;
        const totalBenefitsPerPaycheck = Number(employeeBenefitsPerPaycheck.toFixed(5));

        // Calculate net with rounding rules
        const netPay = Math.ceil((grossPerPaycheck - totalBenefitsPerPaycheck) * 10000) / 10000;

        const expectedGross = grossPerPaycheck.toFixed(2);
        const expectedBenefits = totalBenefitsPerPaycheck.toFixed(2);
        const expectedNet = netPay.toFixed(2);

        // Verify employee exists with correct no-dependent calculations
        dashboardPage.verifyEmployeeInTableByUserId(userId, employee.firstName, employee.lastName, employee.dependents);
        dashboardPage.verifyBenefitCalculationsByUserId(userId, expectedGross, expectedBenefits, expectedNet);

        // Delete the employee
        dashboardPage.getDeleteButtonByUserId(userId).click();
        dashboardPage.getDeleteModal().should('be.visible');
        dashboardPage.confirmDelete();

        cy.wait('@deleteEmployee').then((deleteInterception) => {
          expect(deleteInterception.response.statusCode).to.eq(200);

          // Verify complete removal
          cy.get('#employeesTable').should('not.contain', userId);
          cy.get('#employeesTable').should('not.contain', 'NoDependentsDelete');
        });
      });
    });
  });

  describe('UI/UX Testing', () => {
    it('BUG: Edit modal shows "Add Employee" instead of "Edit Employee"', () => {
      // Create employee first
      dashboardPage.clickAddEmployee();
      dashboardPage.fillEmployeeForm('Cypress', 'EditBugTest', 1);
      dashboardPage.submitAddEmployee();

      cy.wait('@createEmployee').then((interception) => {
        expect(interception.response.statusCode).to.eq(200);
        const userId = interception.response.body.id;

        // Click edit for this specific employee
        dashboardPage.getEditButtonByUserId(userId).click();
        dashboardPage.getEmployeeModal().should('be.visible');

        // This should fail - documenting the bug
        dashboardPage.verifyModalTitle('Edit Employee'); // Will fail due to bug
      });
    });

    it('BUG: should show currency symbols for monetary fields', () => {
      // Create employee first to have data in table
      dashboardPage.clickAddEmployee();
      dashboardPage.fillEmployeeForm('Cypress', 'CurrencyTest', 1);
      dashboardPage.submitAddEmployee();

      cy.wait('@createEmployee').then((interception) => {
        expect(interception.response.statusCode).to.eq(200);
        const userId = interception.response.body.id;

        // This test will FAIL until currency symbols are added
        dashboardPage.getRowByUserId(userId).within(() => {
          cy.get('td').should('contain', '$'); // This WILL FAIL - documenting the bug
        });
      });
    });

    it('BUG: should not allow special characters in name fields', () => {
      // This test will FAIL until validation is implemented
      dashboardPage.clickAddEmployee();
      dashboardPage.getFirstNameInput().type('Cypress.');
      dashboardPage.getLastNameInput().type('Test!');
      dashboardPage.getDependentsInput().type('1');

      dashboardPage.submitAddEmployee();

      // This should fail validation but currently doesn't (bug)
      cy.wait('@createEmployee').then((interception) => {
        // Test expects validation to reject special characters
        expect(interception.response.statusCode).to.not.eq(200); // This WILL FAIL - bug exists
      });
    });

    it('BUG: Edit modal should show "Edit Employee" title', () => {
      // Create employee first
      dashboardPage.clickAddEmployee();
      dashboardPage.fillEmployeeForm('Cypress', 'EditTitleBug', 1);
      dashboardPage.submitAddEmployee();

      cy.wait('@createEmployee').then((interception) => {
        expect(interception.response.statusCode).to.eq(200);
        const userId = interception.response.body.id;

        // Click edit for this specific employee
        dashboardPage.getEditButtonByUserId(userId).click();
        dashboardPage.getEmployeeModal().should('be.visible');

        // This test will FAIL until the modal title bug is fixed
        dashboardPage.verifyModalTitle('Edit Employee'); // This WILL FAIL - shows "Add Employee"
      });
    });

    it('BUG: table should not break with long content', () => {
      // This test will FAIL until table layout is fixed
      dashboardPage.clickAddEmployee();
      dashboardPage.fillEmployeeForm('CypressVeryLongFirstNameThatShouldNotBreakTheTableLayoutAndCauseVisualIssues', 'LongLastName', 1);
      dashboardPage.submitAddEmployee();

      cy.wait('@createEmployee').then((interception) => {
        expect(interception.response.statusCode).to.eq(200);
        const userId = interception.response.body.id;

        // Check that table doesn't have visual breaks
        // This assertion will FAIL until table layout is fixed
        dashboardPage.getEmployeesTable().should('not.have.css', 'overflow-x', 'scroll'); // This WILL FAIL

        // Check for the visual break between columns
        cy.get('#employeesTable').should('not.contain.html', 'style="border'); // This WILL FAIL
      });
    });
  });

  describe('Security Testing', () => {
    it('SECURITY BUG: should not expose employee ID in hidden input for deletion', () => {
      // Create employee first
      dashboardPage.clickAddEmployee();
      dashboardPage.fillEmployeeForm('Cypress', 'SecurityTest', 1);
      dashboardPage.submitAddEmployee();

      cy.wait('@createEmployee').then((interception) => {
        expect(interception.response.statusCode).to.eq(200);
        const userId = interception.response.body.id;

        // Security Bug: Hidden input exposes employee ID
        dashboardPage.getDeleteButtonByUserId(userId).click();
        dashboardPage.getDeleteModal().should('be.visible');
        dashboardPage.getDeleteIdHiddenInput().should('exist');

        // This is a security vulnerability - hidden inputs can be manipulated
        dashboardPage.getDeleteIdHiddenInput().then(($input) => {
          const originalId = $input.val();
          expect(originalId).to.not.be.empty;
          expect(originalId).to.eq(userId);

          // Demonstrate the vulnerability - ID can be changed
          cy.wrap($input).invoke('val', 'malicious-id-12345');
          dashboardPage.getDeleteIdHiddenInput().should('have.value', 'malicious-id-12345');

          // Restore original ID and cancel
          cy.wrap($input).invoke('val', originalId);
          dashboardPage.cancelDelete();
        });
      });
    });

    it('should use meaningful selectors for delete buttons', () => {
      // Create employee for selector testing
      dashboardPage.clickAddEmployee();
      dashboardPage.fillEmployeeForm('Cypress', 'SelectorTest', 1);
      dashboardPage.submitAddEmployee();

      cy.wait('@createEmployee').then((interception) => {
        expect(interception.response.statusCode).to.eq(200);
        const userId = interception.response.body.id;

        // Bug: .fa-times and .fa-edit are not meaningful selectors
        dashboardPage.getDeleteButtonByUserId(userId).should('exist');
        dashboardPage.getEditButtonByUserId(userId).should('exist');

        // Check current selectors exist
        dashboardPage.getRowByUserId(userId).within(() => {
          cy.get('.fa-times').should('exist');
          cy.get('.fa-edit').should('exist');
        });
      });
    });

    it('SECURITY BUG: Employee data manipulation through DOM inspection', () => {
      // Create employee to test data exposure
      dashboardPage.clickAddEmployee();
      dashboardPage.fillEmployeeForm('Cypress', 'DataExposure', 2);
      dashboardPage.submitAddEmployee();

      cy.wait('@createEmployee').then((interception) => {
        expect(interception.response.statusCode).to.eq(200);
        const userId = interception.response.body.id;

        // Test edit modal for data exposure
        dashboardPage.getEditButtonByUserId(userId).click();
        dashboardPage.getEmployeeModal().should('be.visible');

        // Check if employee ID is exposed in form elements
        cy.get('#employeeModal').within(() => {
          cy.get('input[type="hidden"]').should('have.length.greaterThan', 0);
        });

        dashboardPage.cancelModal();
      });
    });

    it('SECURITY BUG: Client-side validation bypass', () => {
      // Test if client-side validation can be bypassed
      dashboardPage.clickAddEmployee();

      // Try to bypass validation by directly setting values
      dashboardPage.getFirstNameInput().invoke('val', '');
      dashboardPage.getLastNameInput().invoke('val', '');
      dashboardPage.getDependentsInput().invoke('val', '-5');

      // Try to submit with invalid data
      dashboardPage.submitAddEmployee();

      // Should reject invalid data
      cy.wait('@createEmployee').then((interception) => {
        expect(interception.response.statusCode).to.not.eq(200);
      });
    });

    it('SECURITY TEST: XSS vulnerability in employee names', () => {
      // Test for XSS vulnerabilities in name fields
      const xssPayload = '<script>alert("XSS")</script>';

      dashboardPage.clickAddEmployee();
      dashboardPage.getFirstNameInput().type('Cypress');
      dashboardPage.getLastNameInput().type(xssPayload);
      dashboardPage.getDependentsInput().type('1');

      // Set up alert handler to catch XSS
      cy.window().then((win) => {
        cy.stub(win, 'alert').as('windowAlert');
      });

      dashboardPage.submitAddEmployee();

      cy.wait('@createEmployee').then((interception) => {
        if (interception.response.statusCode === 200) {
          const userId = interception.response.body.id;

          // Check if XSS payload is executed when displayed
          dashboardPage.getRowByUserId(userId).should('be.visible');

          // Verify alert was not called (XSS prevented)
          cy.get('@windowAlert').should('not.have.been.called');

          // Check if the payload is properly escaped in the table
          dashboardPage.getRowByUserId(userId).within(() => {
            cy.contains(xssPayload).should('exist');
          });
        }
      });
    });
  });

  describe('Validation Testing', () => {
    it('should require all mandatory fields', () => {
      dashboardPage.clickAddEmployee();

      // Try to submit without filling required fields
      dashboardPage.submitAddEmployee();

      // Should show validation errors and modal should stay open
      dashboardPage.getEmployeeModal().should('be.visible');

      // API call should not be made or should return error
      cy.wait('@createEmployee').then((interception) => {
        expect(interception.response.statusCode).to.not.eq(200);
      });
    });

    it('should validate dependents as positive integer', () => {
      dashboardPage.clickAddEmployee();
      dashboardPage.fillEmployeeForm('Cypress', 'ValidationTest', -1);
      dashboardPage.submitAddEmployee();

      // Should reject negative dependents
      cy.wait('@createEmployee').then((interception) => {
        expect(interception.response.statusCode).to.not.eq(200);
      });
    });

    it('should handle maximum dependents limit (32)', () => {
      dashboardPage.clickAddEmployee();
      dashboardPage.fillEmployeeForm('Cypress', 'MaxTest', 33); // Over max of 32
      dashboardPage.submitAddEmployee();

      // Should reject over maximum
      cy.wait('@createEmployee').then((interception) => {
        expect(interception.response.statusCode).to.not.eq(200);
      });
    });

    it('should validate name field lengths (50 chars max)', () => {
      const longName = 'a'.repeat(51); // Over 50 char limit

      dashboardPage.clickAddEmployee();
      dashboardPage.getFirstNameInput().type(longName);
      dashboardPage.getLastNameInput().type('Cypress');
      dashboardPage.getDependentsInput().type('1');
      dashboardPage.submitAddEmployee();

      // Should reject long names
      cy.wait('@createEmployee').then((interception) => {
        expect(interception.response.statusCode).to.not.eq(200);
      });
    });

    it('should validate dependents as integer (not decimal)', () => {
      dashboardPage.clickAddEmployee();
      dashboardPage.fillEmployeeForm('Cypress', 'DecimalTest', 2.5); // Decimal value
      dashboardPage.submitAddEmployee();

      // Should reject decimal values
      cy.wait('@createEmployee').then((interception) => {
        expect(interception.response.statusCode).to.not.eq(200);
      });
    });

    it('should validate minimum dependents (0 or greater)', () => {
      dashboardPage.clickAddEmployee();
      dashboardPage.fillEmployeeForm('Cypress', 'NegativeTest', -5);
      dashboardPage.submitAddEmployee();

      // Should reject negative values
      cy.wait('@createEmployee').then((interception) => {
        expect(interception.response.statusCode).to.not.eq(200);
      });
    });

    it('should handle empty string values in required fields', () => {
      dashboardPage.clickAddEmployee();

      // Test empty strings in required fields
      dashboardPage.getFirstNameInput().type(' ').clear(); // Empty string
      dashboardPage.getLastNameInput().type(' ').clear(); // Empty string
      dashboardPage.getDependentsInput().type('1');

      dashboardPage.submitAddEmployee();

      // Should reject empty required fields
      cy.wait('@createEmployee').then((interception) => {
        expect(interception.response.statusCode).to.not.eq(200);
      });
    });
  });
});