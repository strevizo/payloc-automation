const basicToken = Cypress.env('BASIC_TOKEN');

/**
 * Gets all employees from the API using session authentication.
 * @returns {Cypress.Chainable<Cypress.Response<any>>} The Cypress chainable response object.
 */
function getAllEmployees() {
    return cy.request({
        method: 'GET',
        url: `${Cypress.env('API_URL')}/Employees`,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `${basicToken}`,
        },
    });
}

/**
 * Creates a new employee via API using session authentication.
 * @param {Object} employeeData - The employee data object
 * @returns {Cypress.Chainable<Cypress.Response<any>>} The Cypress chainable response object.
 */
export function createEmployee(employeeData) {
    return cy.request({
        method: 'POST',
        url: `${Cypress.env('API_URL')}/Employees`,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `${basicToken}`,
        },
        body: employeeData
    });
}

/**
 * Deletes an employee by ID via API using session authentication.
 * @param {string} employeeId - The employee ID to delete
 * @returns {Cypress.Chainable<Cypress.Response<any>>} The Cypress chainable response object.
 */
export function deleteEmployee(employeeId) {
    return cy.request({
        method: 'DELETE',
        url: `${Cypress.env('API_URL')}/Employees/${employeeId}`,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `${basicToken}`,
        },
        failOnStatusCode: false
    });
}

/**
 * Cleans up test employees by deleting employees with "Cypress" in their name.
 * This ensures we only delete test data and not legitimate seed data.
 * @returns {Cypress.Chainable} Cypress chainable for cleanup operations.
 */
export function deleteAutomationEmployees() {
    return getAllEmployees().then((response) => {
        if (response.body && response.body.length > 0) {
            response.body.forEach(employee => {
                const isCypressTestData = 
                    employee.firstName.includes('Cypress') || 
                    employee.lastName.includes('Cypress');
                
                if (isCypressTestData) {
                    deleteEmployee(employee.id);
                }
            });
        }
    });
}

/**
 * Creates a test employee with default values for testing purposes.
 * All test employees will have "Cypress" in their name for safe cleanup.
 * @param {Object} overrides - Optional overrides for default employee data
 * @returns {Cypress.Chainable<Cypress.Response<any>>} The Cypress chainable response object.
 */
export function createTestEmployee(overrides = {}) {
    const defaultEmployee = {
        firstName: 'Cypress',
        lastName: 'TestEmployee',
        username: `cypress${Date.now()}`,
        dependants: 1,
        salary: 52000
    };
    
    const employeeData = { ...defaultEmployee, ...overrides };
    return createEmployee(employeeData);
}