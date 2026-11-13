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

Optional `timeout` (ms) in `qavajs.config.ts` limits steps that wait on their own, such as window switching and scrolling until an element is visible.

## WebDriver BiDi and Classic sessions
WebdriverIO v10 uses WebDriver BiDi by default and removed `switchFrame`/`switchWindow` there. The frame and window steps
work in both kinds of sessions: in BiDi the selected frame or tab is kept on the world, so custom steps should use
- `this.target` for element lookups, `execute` and input actions (the selected frame/tab, or the browser)
- `this.tab` for url, title and navigation (the top-level tab of the selection)

`this.driver` still drives the session itself (cookies, mocks, window handles, screenshots).
Set `'wdio:enforceWebDriverClassic': true` in capabilities to run a Classic session.

## Development and testing
Install dependencies
```bash
npm install
```

Build lib
```bash
npm run build
```

Lint, type check and run unit tests
```bash
npm run lint
npm run typecheck
npm test
```

Execute e2e browser tests (BiDi and Classic projects)
```bash
npm run test:e2e
```
