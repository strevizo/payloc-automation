import LoginPage from '../../support/pages/LoginPage';
import EmployeeDashboardPage from '../../support/pages/EmployeeDashboardPage';

describe('Login Authentication', () => {
    const loginPage = new LoginPage();
    const dashboardPage = new EmployeeDashboardPage();
    const loginUrl = Cypress.env('LOGIN_URL');
    const baseUrl = Cypress.env('BASE_URL');
    const validUsername = Cypress.env('USERNAME');
    const validPassword = Cypress.env('PASSWORD');

    beforeEach(() => {
        cy.visit(loginUrl);
    });

    describe('Login Page Elements', () => {
        it('should display all required login page elements', () => {
            loginPage.verifyLoginPageLoaded();
            loginPage.verifyPageTitleLink();
            loginPage.verifyLoginButtonText();
            loginPage.verifyFooterContent();
            loginPage.verifyPaylocityLogo();
        });

        it('should show validation summary container', () => {
            loginPage.verifyValidationSummaryExists();
        });

        it('SECURITY BUG: should not expose CSRF token in hidden input', () => {
            // Document security vulnerability
            loginPage.verifyCsrfTokenDoesNotExist();
            // This token exposure could be a CSRF vulnerability
        });
    });

    describe('Valid Login Scenarios', () => {
        it('should successfully login with valid credentials', () => {
            loginPage.login(validUsername, validPassword);

            // Should redirect to Benefits Dashboard
            loginPage.verifyRedirectToDashboard();
            dashboardPage.verifyPageLoaded();
        });

        it('should maintain session after successful login', () => {
            // Login first
            loginPage.login(validUsername, validPassword);
            loginPage.verifyRedirectToDashboard();

            // Refresh page - should stay logged in
            cy.reload();
            loginPage.verifyRedirectToDashboard();
            dashboardPage.getEmployeesTable().should('be.visible');
        });
    });

    describe('Invalid Login Scenarios', () => {
        it('should reject login with invalid username', () => {
            loginPage.login('invaliduser', validPassword);
            loginPage.verifyStayOnLoginPage();
        });

        it('should reject login with invalid password', () => {
            loginPage.login(validUsername, 'invalidpassword');
            loginPage.verifyStayOnLoginPage();
        });

        it('should reject login with empty credentials', () => {
            loginPage.submitLogin();
            loginPage.verifyStayOnLoginPage();
        });

        it('should show validation errors for empty username', () => {
            loginPage.getPasswordInput().type(validPassword);
            loginPage.submitLogin();

            loginPage.verifyStayOnLoginPage();
            loginPage.verifyUsernameRequiredError();
        });

        it('should show validation errors for empty password', () => {
            loginPage.getUsernameInput().type(validUsername);
            loginPage.submitLogin();

            loginPage.verifyStayOnLoginPage();
            loginPage.verifyPasswordRequiredError();
        });

        it('should show validation errors for both empty fields', () => {
            loginPage.submitLogin();

            loginPage.verifyStayOnLoginPage();
            loginPage.verifyBothFieldsRequiredErrors();
        });

        it('should display validation errors in proper HTML structure', () => {
            loginPage.submitLogin();

            // Verify the complete structure
            loginPage.getValidationErrors()
                .should('be.visible')
                .should('have.attr', 'data-valmsg-summary', 'true');

            loginPage.verifyValidationErrorHeader();
            loginPage.getValidationErrorList().should('exist');
            loginPage.getValidationErrorItems().should('have.length.at.least', 1);
        });
    });

    describe('CRITICAL: Authentication Bypass Vulnerability', () => {
        it('should NOT allow direct access to Benefits page without authentication', () => {
            // CRITICAL BUG: This test will likely fail due to the authentication bypass
            cy.visit(baseUrl, { failOnStatusCode: false });

            // Should redirect to login page, but currently doesn't
            loginPage.verifyStayOnLoginPage(); // This will likely fail - documenting the bug
        });

        it('should NOT show functional UI elements when unauthenticated', () => {
            // CRITICAL BUG: Currently shows functional dashboard even without auth
            cy.visit(baseUrl, { failOnStatusCode: false });

            // These should not be visible/functional without authentication
            dashboardPage.getAddEmployeeButton().should('not.exist'); // Will likely fail - bug documentation
            dashboardPage.getEmployeesTable().should('not.exist'); // Will likely fail - bug documentation
        });

        it('should NOT allow API calls without proper authentication', () => {
            // Visit dashboard directly without login
            cy.visit(baseUrl, { failOnStatusCode: false });

            // Try to make API call - should fail initially
            cy.request({
                method: 'GET',
                url: `${Cypress.env('API_URL')}/Employees`,
                failOnStatusCode: false
            }).then((response) => {
                // Should be 401 Unauthorized initially
                expect(response.status).to.eq(401);
            });

            // SECURITY BUG: Adding an employee somehow authenticates the user
            dashboardPage.getAddEmployeeButton().should('be.visible');
            dashboardPage.clickAddEmployee();
            dashboardPage.getEmployeeModal().should('be.visible');

            // Fill form with Cypress test data
            dashboardPage.fillEmployeeForm('Cypress', 'SecurityBug', 1);
            dashboardPage.submitAddEmployee();

            // Wait for modal to close
            dashboardPage.getEmployeeModal().should('not.be.visible');

            // Now try the API call again - this should still fail but likely works
            cy.request({
                method: 'GET',
                url: `${Cypress.env('API_URL')}/Employees`,
                failOnStatusCode: false
            }).then((response) => {
                // This SHOULD be 401 but will likely be 200 due to the security bug
                if (response.status === 200) {
                    cy.log('CRITICAL SECURITY BUG: Adding employee bypassed authentication!');
                    cy.log('User is now authenticated without proper login credentials');

                    // Document that the bug exists
                    expect(response.status).to.eq(401, 'SECURITY BUG: API call should fail without proper authentication, but adding an employee granted access');
                } else {
                    expect(response.status).to.eq(401);
                }
            });
        });

        it('SECURITY BUG: Invalid login credentials + Add Employee bypasses authentication', () => {
            // Try to login with invalid credentials
            loginPage.login('invaliduser', 'invalidpassword');

            // Should stay on login page due to invalid credentials
            loginPage.verifyStayOnLoginPage();

            // But navigate to Benefits page anyway (simulating the bypass)
            cy.visit(baseUrl, { failOnStatusCode: false });

            // Initial API call should fail
            cy.request({
                method: 'GET',
                url: `${Cypress.env('API_URL')}/Employees`,
                failOnStatusCode: false
            }).then((response) => {
                expect(response.status).to.eq(401);
            });

            // SECURITY BUG: Adding employee grants access even with invalid credentials
            dashboardPage.getAddEmployeeButton().should('be.visible');
            dashboardPage.clickAddEmployee();
            dashboardPage.fillEmployeeForm('Cypress', 'InvalidCredsBug', 2);
            dashboardPage.submitAddEmployee();
            dashboardPage.getEmployeeModal().should('not.be.visible');

            // API call should still fail but likely works due to bypass
            cy.request({
                method: 'GET',
                url: `${Cypress.env('API_URL')}/Employees`,
                failOnStatusCode: false
            }).then((response) => {
                if (response.status === 200) {
                    cy.log('CRITICAL: Authentication bypassed with invalid credentials!');
                    expect(response.status).to.eq(401, 'SECURITY BUG: Invalid credentials should not grant API access');
                } else {
                    expect(response.status).to.eq(401);
                }
            });
        });

        it('SECURITY BUG: Wrong password + Add Employee bypasses authentication', () => {
            // Try to login with valid username but wrong password
            loginPage.login(validUsername, 'wrongpassword123');

            // Should stay on login page due to wrong password
            loginPage.verifyStayOnLoginPage();

            // Navigate to Benefits page (bypass)
            cy.visit(baseUrl, { failOnStatusCode: false });

            // Verify initial API rejection
            cy.request({
                method: 'GET',
                url: `${Cypress.env('API_URL')}/Employees`,
                failOnStatusCode: false
            }).then((response) => {
                expect(response.status).to.eq(401);
            });

            // SECURITY BUG: Add employee with wrong password credentials
            dashboardPage.clickAddEmployee();
            dashboardPage.fillEmployeeForm('Cypress', 'WrongPasswordBug', 0);
            dashboardPage.submitAddEmployee();

            // Check if authentication was bypassed
            cy.request({
                method: 'GET',
                url: `${Cypress.env('API_URL')}/Employees`,
                failOnStatusCode: false
            }).then((response) => {
                if (response.status === 200) {
                    cy.log('CRITICAL: Wrong password bypassed via Add Employee action!');
                    expect(response.status).to.eq(401, 'SECURITY BUG: Wrong password should not grant access');
                } else {
                    expect(response.status).to.eq(401);
                }
            });
        });

        it('SECURITY BUG: Empty credentials + Add Employee bypasses authentication', () => {
            // Try to login with empty credentials
            loginPage.submitLogin();

            // Should stay on login page with validation errors
            loginPage.verifyStayOnLoginPage();
            loginPage.verifyValidationErrorsVisible();

            // Navigate to Benefits page anyway
            cy.visit(baseUrl, { failOnStatusCode: false });

            // Initial API should be unauthorized
            cy.request({
                method: 'GET',
                url: `${Cypress.env('API_URL')}/Employees`,
                failOnStatusCode: false
            }).then((response) => {
                expect(response.status).to.eq(401);
            });

            // SECURITY BUG: Add employee without any credentials
            dashboardPage.clickAddEmployee();
            dashboardPage.fillEmployeeForm('Cypress', 'NoCredsBug', 3);
            dashboardPage.submitAddEmployee();

            // Verify if bypass occurred
            cy.request({
                method: 'GET',
                url: `${Cypress.env('API_URL')}/Employees`,
                failOnStatusCode: false
            }).then((response) => {
                if (response.status === 200) {
                    cy.log('CRITICAL: No credentials required - authentication completely bypassed!');
                    expect(response.status).to.eq(401, 'SECURITY BUG: No credentials should not grant access');
                } else {
                    expect(response.status).to.eq(401);
                }
            });
        });

        it('DOCUMENTS BUG: Add Employee button works without authentication', () => {
            // This test documents the current buggy behavior
            cy.visit(baseUrl, { failOnStatusCode: false });

            // Currently, the Add Employee button is visible and functional
            dashboardPage.getAddEmployeeButton().should('be.visible'); // This passes but shouldn't

            // Clicking it opens the modal (which shouldn't work)
            dashboardPage.clickAddEmployee();
            dashboardPage.getEmployeeModal().should('be.visible'); // This passes but shouldn't

            // Can even fill out the form
            dashboardPage.fillEmployeeForm('Cypress', 'SecurityBug', 1);

            // Submitting might actually work (major security issue)
            dashboardPage.submitAddEmployee();

            // This documents that the authentication bypass allows full functionality
        });
    });

    describe('Logout Functionality', () => {
        beforeEach(() => {
            // Login first
            loginPage.login(validUsername, validPassword);
            loginPage.verifyRedirectToDashboard();
        });

        it('should successfully logout and redirect to login page', () => {
            dashboardPage.clickLogOut();

            // Should redirect to login page
            loginPage.verifyStayOnLoginPage();
            loginPage.getUsernameInput().should('be.visible');
        });

        it('should clear session after logout', () => {
            dashboardPage.clickLogOut();

            // Try to access Benefits page directly - should redirect to login
            cy.visit(baseUrl, { failOnStatusCode: false });
            loginPage.verifyStayOnLoginPage(); // May fail due to auth bypass bug
        });
    });

    describe('Session Security', () => {
        it('should have secure session management', () => {
            // Login and check for secure session handling
            loginPage.login(validUsername, validPassword);

            // Check that session cookies are secure (if using cookies)
            cy.getCookies().then((cookies) => {
                cookies.forEach(cookie => {
                    if (cookie.name.includes('session') || cookie.name.includes('auth')) {
                        expect(cookie.secure).to.be.true; // Should be secure
                        expect(cookie.httpOnly).to.be.true; // Should be httpOnly
                    }
                });
            });
        });

        it('should prevent session fixation attacks', () => {
            // Get session before login
            cy.getCookies().then((beforeCookies) => {
                loginPage.login(validUsername, validPassword);

                // Session should change after login
                cy.getCookies().then((afterCookies) => {
                    // Session ID should be different (if using session cookies)
                    const beforeSessionCookie = beforeCookies.find(c => c.name.includes('session'));
                    const afterSessionCookie = afterCookies.find(c => c.name.includes('session'));

                    if (beforeSessionCookie && afterSessionCookie) {
                        expect(beforeSessionCookie.value).to.not.equal(afterSessionCookie.value);
                    }
                });
            });
        });
    });

    describe('Input Validation and Security', () => {
        it('should handle special characters in username safely', () => {
            loginPage.login('<script>alert("xss")</script>', validPassword);
            loginPage.verifyStayOnLoginPage();

            // Should not execute any scripts
            cy.on('window:alert', () => {
                throw new Error('XSS vulnerability detected');
            });
        });

        it('should handle special characters in password safely', () => {
            loginPage.login(validUsername, '<script>alert("xss")</script>');
            loginPage.verifyStayOnLoginPage();

            // Should not execute any scripts
            cy.on('window:alert', () => {
                throw new Error('XSS vulnerability detected');
            });
        });

        it('should handle SQL injection attempts in username', () => {
            loginPage.login("admin'; DROP TABLE users; --", validPassword);
            loginPage.verifyStayOnLoginPage();

            // Should safely handle SQL injection attempts
        });

        it.only('VALIDATION BUG: should limit username and password length according to schema validation', () => {
            // From swagger: username maxLength is 50, but let's test with longer strings
            const longUsername = 'a'.repeat(51); // 51 chars - should be rejected
            const longPassword = 'b'.repeat(100); // Test long password too

            loginPage.getUsernameInput().type(longUsername);
            loginPage.getPasswordInput().type(longPassword);
            loginPage.submitLogin();

            // Should show validation error for username exceeding 50 chars
            loginPage.verifyStayOnLoginPage();

            // Check if validation error appears (this might fail - documenting the bug)
            loginPage.getValidationErrors().should('be.visible');
            loginPage.verifySpecificValidationError('The field Username must be a string with a maximum length of 50');
        });

        it.only('VALIDATION BUG: should enforce 50 character limit on username', () => {
            // This test documents that the 50-char limit is not enforced
            const exactlyFiftyChars = 'a'.repeat(50); // Should pass
            const fiftyOneChars = 'a'.repeat(51);     // Should fail but likely passes

            // Test with exactly 50 chars - should work
            loginPage.getUsernameInput().clear().type(exactlyFiftyChars);
            loginPage.getPasswordInput().type(validPassword);
            loginPage.submitLogin();

            // Clear and test with 51 chars - should fail validation
            cy.visit(loginUrl);
            loginPage.getUsernameInput().type(fiftyOneChars);
            loginPage.getPasswordInput().type(validPassword);
            loginPage.submitLogin();

            // Should show validation error but likely doesn't (bug)
            loginPage.verifyStayOnLoginPage();
            // This assertion will likely fail, documenting the validation bug
            loginPage.verifySpecificValidationError('The field Username must be a string with a maximum length of 50');
        });
    });
});