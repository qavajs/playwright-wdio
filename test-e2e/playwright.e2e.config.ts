import { defineConfig } from '@playwright/test';
import { tags, WdioOptions } from '../lib';

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// require('dotenv').config();

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig<WdioOptions>({
    testMatch: 'e2e.config.ts',
    /* Run tests in files in parallel */
    fullyParallel: true,
    /* Fail the build on CI if you accidentally left test.only in the source code. */
    forbidOnly: !!process.env.CI,
    /* Retry on CI only */
    retries: 1,
    /* Opt out of parallel tests on CI. */
    workers: process.env.CI ? 1 : undefined,
    /* Reporter to use. See https://playwright.dev/docs/test-reporters */
    reporter: [
        ['html', { open: 'never', outputFolder: 'report' }],
        ['junit', { outputFile: 'report/report.xml' }]
    ],
    expect: {
        timeout: 15000
    },
    webServer: {
        command: 'npx ts-node support/server.ts',
        url: 'http://localhost:3000/storage.html',
        reuseExistingServer: !process.env.CI,
        stdout: 'pipe',
        stderr: 'pipe',
    },
    grep: tags('not @skip'),
    /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
    use: {
        /* Base URL to use in actions like `await page.goto('/')`. */
        // baseURL: 'http://127.0.0.1:3000',

        /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
        // headless: false
    },

    /* Configure projects for major browsers */
    projects: [
        {
            name: 'e2e',
            use: {
                wdioLaunchOptions: {
                    logLevel: 'error',
                    capabilities: {
                        browserName: 'chrome',
                        "goog:chromeOptions": {
                            args: ['headless=new']
                        }
                    },
                }
            }
        }
    ]
});
