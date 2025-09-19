const { defineConfig } = require('cypress');
require('dotenv').config();

module.exports = defineConfig({
  e2e: {
    env: {
      ...process.env
    },
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
});