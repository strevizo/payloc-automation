# Benefits Dashboard Test Suite

Automated testing suite for the Paylocity Benefits Dashboard application using Cypress.

## Overview

This project contains comprehensive API and UI tests covering employee management functionality including adding, editing, and deleting employees with benefit calculations.

## Tech Stack

- **Cypress** - End-to-end testing framework
- **JavaScript/ES6** - Test scripting language
- **Page Object Model** - Design pattern for maintainable UI tests
- **JSON Schema Validation** - API response structure validation using chai-json-schema
- **Session Management** - Cypress session API for authentication persistence
- **API Intercepts** - Network request monitoring and stubbing
- **Environment Configuration** - dotenv for environment-specific settings

## Setup

1. Install dependencies:
```
npm install
```

2. Configure environment variables in .env:
```
USERNAME=your_username
PASSWORD=your_password
API_URL=https://wmxrwq14uc.execute-api.us-east-1.amazonaws.com/Prod/api
BASE_URL=https://wmxrwq14uc.execute-api.us-east-1.amazonaws.com/Prod/Benefits
LOGIN_URL=https://wmxrwq14uc.execute-api.us-east-1.amazonaws.com/Prod/Account/Login
PAY_PERIODS_PER_YEAR=26
EMPLOYEE_BENEFIT_COST=1000
DEPENDANT_BENEFIT_COST=500
```

### Benefit Calculation Variables

The following environment variables control the benefit calculation logic and allow tests to adapt to business rule changes:

- **PAY_PERIODS_PER_YEAR=26** - Number of pay periods annually (bi-weekly payroll)
- **EMPLOYEE_BENEFIT_COST=1000** - Annual benefit cost per employee in dollars
- **DEPENDANT_BENEFIT_COST=500** - Annual benefit cost per dependent in dollars

These values are used to dynamically calculate expected gross pay, benefit deductions, and net pay in test assertions. Modifying these variables will automatically update all benefit calculation validations across the test suite.

## Running Tests

# Run all tests headlessly
```
npx cypress run
```

# Open Cypress Test Runner
```
npx cypress open
```

# Run specific test file
```
npx cypress run --spec "cypress/e2e/employee-dashboard.cy.js"
```

## Test Structure

- **API Tests**: /cypress/e2e/API/ - Endpoint testing with JSON schema validation
- **UI Tests**: /cypress/e2e/ - End-to-end user story testing
- **Page Objects**: /cypress/support/pages/ - Reusable page components
- **Helpers**: /cypress/support/api-helpers/ - API utility functions
- **Schemas**: /cypress/support/schemas/ - JSON schema definitions for API validation

## Key Features

- Session-based authentication with automatic retry logic
- Dynamic benefit calculations using environment variables
- Page Object Model for maintainable UI automation
- JSON schema validation for API response structure verification
- Comprehensive bug documentation through failing tests
- API intercepts for reliable test execution and monitoring
- Environment-driven configuration for multi-environment support

## Test Coverage

- Employee CRUD operations
- Benefit calculation validation with dynamic rates
- API response schema validation
- Security vulnerability testing
- Input validation testing
- UI/UX bug documentation