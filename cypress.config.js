const { defineConfig } = require('cypress');
require('dotenv').config();

module.exports = defineConfig({
  e2e: {
    env: {
      USERNAME: process.env.USERNAME,
      PASSWORD: process.env.PASSWORD,
      BASE_URL: process.env.BASE_URL,
      LOGIN_URL: process.env.LOGIN_URL,
      API_URL: process.env.API_URL,
      BASIC_TOKEN: process.env.BASIC_TOKEN,
      PAY_PERIODS_PER_YEAR: process.env.PAY_PERIODS_PER_YEAR,
      EMPLOYEE_BENEFIT_COST: process.env.EMPLOYEE_BENEFIT_COST,
      DEPENDANT_BENEFIT_COST: process.env.DEPENDANT_BENEFIT_COST
    },
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
});