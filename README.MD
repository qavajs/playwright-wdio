# @qavajs/playwright
qavajs implementation for playwright wdio fixtures. Enables features of webdriverio with playwright test runner.

## Installation

```bash
npm install @qavajs/playwright-wdio
```

## Configuration
create `config.ts`
```typescript
import Memory from './memory';
import App from './page_object';

export default {
    paths: ['features/*.feature'],
    require: [
        'node_modules/@qavajs/playwright-wdio/steps.js', // package steps
        'step_definitions/*.ts' // custom step definitions
    ],
    memory: new Memory(),
    pageObject: new App()
}
```
playwright.config.ts

```typescript
import { defineCucumber, WdioOptions } from '@qavajs/playwright-wdio';

export default defineConfig<WdioOptions>({
    testDir: defineCucumber({
        config: 'config.ts',
        profile: 'smoke'
    }),
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
