const { createEmployee, deleteAutomationEmployees } = require("../../support/api-helpers/employees");
import employees from "../../fixtures/employees.json";

describe('Employees API - /Employees', () => {
    const apiUrl = Cypress.env('API_URL');
    const basicToken = Cypress.env('BASIC_TOKEN');
    let newEmployee;

    const headers = {
        'Authorization': `${basicToken}`,
        'Content-Type': 'application/json'
    };

    before('Clear previous automation data', () => {
        deleteAutomationEmployees();
    })

    describe('Positive Test Cases', () => {
        it('should return 200 when getting all employees', () => {
            cy.request({
                method: 'GET',
                url: `${apiUrl}/Employees`,
                headers: headers
            }).then((response) => {
                expect(response.status).to.eq(200);
            });
        });

        it.only('should return 200 when creating a new employee with valid data', () => {
            cy.request({
                method: 'POST',
                url: `${apiUrl}/Employees`,
                headers: headers,
                body: employees.newEmployee
            }).then((response) => {
                expect(response.status).to.eq(200);
                newEmployee = response.body;
            });
        });

        it.only('should return 200 when adding a dependant to an employee', () => {
            // const newEmployee = createEmployee(); 
            // Commenting out to prevent creating many employees and I can't delete,
            // ideally we would create an employee here and use that employee to update
            // instead I will reuse the previously created employee, this breaks test isolation.
            const newName = "Automation";
            const newLastName = "API";
            employees.updateEmployee.id = newEmployee.id;
            employees.updateEmployee.firstName = newName;
            employees.updateEmployee.lastName = newLastName;
            employees.updateEmployee.dependants = 1;

            cy.request({
                method: 'PUT',
                url: `${apiUrl}/Employees`,
                headers: headers,
                body: employees.updateEmployee
            }).then((response) => {
                expect(response.status).to.eq(200);
                const depedantBenefitsCost = 500/26;
                expect(response.body).to.deep.equal({
                    "partitionKey": newEmployee.partitionKey,
                    "sortKey": newEmployee.sortKey,
                    "username": newEmployee.username,
                    "id": newEmployee.id,
                    "firstName": newName,
                    "lastName": newLastName,
                    "dependants": 1,
                    "salary": newEmployee.salary,
                    "gross": newEmployee.gross,
                    "benefitsCost": newEmployee.benefitsCost + depedantBenefitsCost,
                    "net": newEmployee.gross - depedantBenefitsCost,
                })
            });
        });
    });

    describe('Negative Test Cases', () => {
        it('should return 401 when GET request has no authorization header', () => {
            cy.request({
                method: 'GET',
                url: `${apiUrl}/Employees`,
                failOnStatusCode: false
            }).then((response) => {
                expect(response.status).to.eq(401);
            });
        });

        it('should return 401 when POST request has no authorization header', () => {
            const employeeData = {
                firstName: 'John',
                lastName: 'Doe',
                username: 'johndoe'
            };

            cy.request({
                method: 'POST',
                url: `${apiUrl}/Employees`,
                body: employeeData,
                failOnStatusCode: false
            }).then((response) => {
                expect(response.status).to.eq(401);
            });
        });

        it('should return 400 when POST request has missing required fields', () => {
            const invalidEmployeeData = {
                dependants: 2,
                salary: 75000
            };

            cy.request({
                method: 'POST',
                url: `${apiUrl}/Employees`,
                headers: headers,
                body: invalidEmployeeData,
                failOnStatusCode: false
            }).then((response) => {
                expect(response.status).to.eq(400);
            });
        });

        it('should return 401 when PUT request has no authorization header', () => {
            const employeeData = {
                id: '12345678-1234-1234-1234-123456789012',
                firstName: 'Jane',
                lastName: 'Smith',
                username: 'janesmith'
            };

            cy.request({
                method: 'PUT',
                url: `${apiUrl}/Employees`,
                body: employeeData,
                failOnStatusCode: false
            }).then((response) => {
                expect(response.status).to.eq(401);
            });
        });

        it('should return 400 when PUT request has missing required fields', () => {
            const invalidEmployeeData = {
                id: '12345678-1234-1234-1234-123456789012',
                dependants: 1,
                salary: 80000
            };

            cy.request({
                method: 'PUT',
                url: `${apiUrl}/Employees`,
                headers: headers,
                body: invalidEmployeeData,
                failOnStatusCode: false
            }).then((response) => {
                expect(response.status).to.eq(400);
            });
        });
    });
});