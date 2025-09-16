/**
 * Gets all employees from the API.
 * @returns {Cypress.Chainable<Cypress.Response<any>>} The Cypress chainable response object.
 */
function getAllEmployees() {
    return cy.request({
        method: 'GET',
        url: `${Cypress.env('API_URL')}/Employees`,
        headers: {
            'Authorization': `${Cypress.env('BASIC_TOKEN')}`,
            'Content-Type': 'application/json'
        },
    });
}

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

export function deleteAutomationEmployees() {
    getAllEmployees().then((response) => { 
        response.body.forEach((employee) => {
            //Token does not have delete permissions so this is commented out
        });
    });
}