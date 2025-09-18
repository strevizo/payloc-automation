chai.use(require('chai-json-schema'))
const { createEmployee, deleteAutomationEmployees } = require("../../support/api-helpers/employees");
import employees from "../../fixtures/employees.json";
import employeeSchemas from "../../support/schemas/employee.js";

describe('Employees API - /Employees', () => {
    const apiUrl = Cypress.env('API_URL');
    const basicToken = Cypress.env('BASIC_TOKEN');
    // Constants based on rules, using .env for easy updates
    const paychecksPerYear = Cypress.env('PAY_PERIODS_PER_YEAR');
    const employeeBenefitsPerYear = Cypress.env('EMPLOYEE_BENEFIT_COST');
    const dependantBenefitsPerYear = Cypress.env('DEPENDANT_BENEFIT_COST');
    let newEmployee;

    const headers = {
        'Authorization': `${basicToken}`,
        'Content-Type': 'application/json'
    };

    before('Clear previous automation data', () => {
        // we are using the before hook to clear previously created data,
        // using afterEach sometimes leave data behind if a test fails.
        // Depending on the API behaviour this might be a bad idea when running
        // in parallel as one spec might delete data another spec is using.
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

        it('should return 200 when creating a new employee with valid data', () => {
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

        it('should return 200 when adding a dependant to an employee', () => {
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

            // Calculate benefits cost with 5 decimal precision
            const employeeBenefitsPerPaycheck = (employeeBenefitsPerYear / paychecksPerYear);
            const grossPerPaycheck = newEmployee.salary / paychecksPerYear;
            const dependantBenefitsPerPaycheck = (dependantBenefitsPerYear * employees.updateEmployee.dependants) / paychecksPerYear;
            const totalBenefitsPerPaycheck = Number((employeeBenefitsPerPaycheck + dependantBenefitsPerPaycheck).toFixed(5));
            
            // Calculate net with 5 decimal precision
            const netPay = Math.ceil(((grossPerPaycheck) - totalBenefitsPerPaycheck) * 10000) / 10000;

            cy.request({
                method: 'PUT',
                url: `${apiUrl}/Employees`,
                headers: headers,
                body: employees.updateEmployee
            }).then((response) => {
                expect(response.status).to.eq(200);
                expect(response.body).to.be.jsonSchema(employeeSchemas.employeeBenefits);
                expect(response.body).to.deep.equal({
                    "partitionKey": newEmployee.partitionKey,
                    "sortKey": newEmployee.sortKey,
                    "username": newEmployee.username,
                    "id": newEmployee.id,
                    "firstName": newName,
                    "lastName": newLastName,
                    "dependants": 1,
                    "salary": newEmployee.salary,
                    "gross": grossPerPaycheck,
                    "benefitsCost": totalBenefitsPerPaycheck,
                    "net": netPay
                });
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