export function createEmployee(employeeData) {
    return cy.request({
        method: 'POST',
        url: `${Cypress.env('API_URL')}/Employees`,
        headers: {
            'Authorization': `${Cypress.env('BASIC_TOKEN')}`,
            'Content-Type': 'application/json'
        },
        body: employeeData
    });
};