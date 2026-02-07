# @qavajs/playwright
qavajs implementation for playwright wdio fixtures. Enables features of webdriverio with playwright test runner.

## Installation

```bash
npm install @qavajs/playwright-wdio
```

## Configuration
create `qavajs.config.ts`

```typescript
import { defineConfig } from '@qavajs/playwright-wdio';
import Memory from './memory';
import App from './page_object';

export default defineConfig({
    paths: ['features/*.feature'],
    require: [
        'node_modules/@qavajs/playwright-wdio/steps.js', // package steps
        'step_definitions/*.ts' // custom step definitions
    ],
    memory: new Memory(),
    pageObject: new App()
});
```
playwright.config.ts

```typescript
import { defineConfig } from '@playwright/test';
import { WdioOptions } from '@qavajs/playwright-wdio';

export default defineConfig<WdioOptions>({
    testMatch: 'qavajs.config.ts',
    projects: [
        {
            name: 'chrome',
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
```

## Development and testing
Install dependencies
```bash
npm install
```

Build lib
```bash
npm run build
```

Execute e2e browser tests
```bash
npm run test:e2e
```
