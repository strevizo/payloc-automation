const { createEmployee, deleteAutomationEmployees } = require("../../support/api-helpers/employees");
import employees from "../../fixtures/employees.json";
import employeeSchemas from "../../support/schemas/employee.js";

describe('Employees API - /Employees/{id}', () => {
    const apiUrl = Cypress.env('API_URL');
    const basicToken = Cypress.env('BASIC_TOKEN');

    const headers = {
        'Authorization': `${basicToken}`,
        'Content-Type': 'application/json'
    };

    let validEmployeeId = '12345678-1234-1234-1234-123456789012';
    const invalidEmployeeId = 'invalid-uuid';

    describe('Positive Test Cases', () => {
        let newEmployee;

        before('Create test employee and clear previous data', () => {
            //deleteAutomationEmployees();
            createEmployee(employees.newEmployee).then((employee) => {
                newEmployee = employee.body;
                validEmployeeId = newEmployee.id;
            });
        });

        it.only('should return 200 when getting an employee by valid ID', () => {
            cy.request({
                method: 'GET',
                url: `${apiUrl}/Employees/${validEmployeeId}`,
                headers: headers
            }).then((response) => {
                expect(response.status).to.eq(200);
                expect(response.body).to.be.jsonSchema(employeeSchemas.employeeBenefits);
            });
        });

        it('should return 200 when deleting an employee by valid ID', () => {
            cy.request({
                method: 'DELETE',
                url: `${apiUrl}/Employees/${validEmployeeId}`,
                headers: headers
            }).then((response) => {
                expect(response.status).to.eq(200);
            });
        });
    });

    describe('Negative Test Cases', () => {
        it('should return 401 when GET request has no authorization header', () => {
            cy.request({
                method: 'GET',
                url: `${apiUrl}/Employees/${validEmployeeId}`,
                failOnStatusCode: false
            }).then((response) => {
                expect(response.status).to.eq(401);
            });
        });

        it('should return 401 when DELETE request has no authorization header', () => {
            cy.request({
                method: 'DELETE',
                url: `${apiUrl}/Employees/${validEmployeeId}`,
                failOnStatusCode: false
            }).then((response) => {
                expect(response.status).to.eq(401);
            });
        });

        it('should return 400 when GET request has invalid UUID format', () => {
            cy.request({
                method: 'GET',
                url: `${apiUrl}/Employees/${invalidEmployeeId}`,
                headers: headers,
                failOnStatusCode: false
            }).then((response) => {
                expect(response.status).to.eq(400);
            });
        });

        it('should return 400 when DELETE request has invalid UUID format', () => {
            cy.request({
                method: 'DELETE',
                url: `${apiUrl}/Employees/${invalidEmployeeId}`,
                headers: headers,
                failOnStatusCode: false
            }).then((response) => {
                expect(response.status).to.eq(400);
            });
        });

        it('should return 404 when GET request uses non-existent employee ID', () => {
            const nonExistentId = '99999999-9999-9999-9999-999999999999';

            cy.request({
                method: 'GET',
                url: `${apiUrl}/Employees/${nonExistentId}`,
                headers: headers,
                failOnStatusCode: false
            }).then((response) => {
                expect(response.status).to.eq(404);
            });
        });

        it('should return 404 when DELETE request uses non-existent employee ID', () => {
            const nonExistentId = '99999999-9999-9999-9999-999999999999';

            cy.request({
                method: 'DELETE',
                url: `${apiUrl}/Employees/${nonExistentId}`,
                headers: headers,
                failOnStatusCode: false
            }).then((response) => {
                expect(response.status).to.eq(404);
            });
        });
    });
});