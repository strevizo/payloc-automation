const { defineConfig } = require('cypress');
const { beforeRunHook, afterRunHook } = require('cypress-mochawesome-reporter/lib');
require('dotenv').config();

module.exports = defineConfig({
  e2e: {
    reporter: 'cypress-mochawesome-reporter',
    reporterOptions: {
      reportFilename: "paylocity-[datetime]-report",
      timestamp: "shortDate",
      charts: true,
      reportTitle: `Paylocity Test Report`,
      reportPageTitle: 'Paylocity Test Report',
      embeddedScreenshots: true,
      inlineAssets: true,
    },
    env: {
      ...process.env
    },
    setupNodeEvents(on, config) {
      on('before:run', async (details) => {
        await beforeRunHook(details);
      });
      on('after:run', async () => {
        await afterRunHook();
      });
    },
  },
  viewportWidth: 1920,
  viewportHeight: 1080
});