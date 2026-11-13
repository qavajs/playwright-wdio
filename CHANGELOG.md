# Change Log

All notable changes to the "@qavajs/playwright-wdio" will be documented in this file.

Check [Keep a Changelog](http://keepachangelog.com/) for recommendations on how to structure this file.

:rocket: - new feature  
:beetle: - bugfix  
:x: - deprecation/removal  
:pencil: - chore  
:microscope: - experimental

## [2.0.0]
- :rocket: support WebdriverIO v10 WebDriver BiDi sessions, where `switchFrame`/`switchWindow` were removed: frame and window steps keep the selected browsing context on the world (`world.browsingContext`), and steps run element lookups, scripts and input actions on it (`world.target`) and url, title and navigation on its tab (`world.tab`). Classic sessions keep the previous behaviour; e2e tests run in both modes
- :rocket: `I switch to {value} window` matches a window handle, or part of the url, title or window name, in both session modes
- :rocket: typed config `QavajsPlaywrightWdioConfig` (`memory`, `pageObject`, `timeout`)
- :rocket: package `exports` map (`.`, `./steps`, `./steps.js`, `./lib/*`), `files` allow-list (`src` is no longer published) and `engines.node >= 22`
- :beetle: `I scroll until ... to be visible` and `I scroll in ... until ... to be visible` fail after `config.timeout` instead of scrolling forever
- :beetle: steps work without a `memory` option in config instead of throwing `Cannot read properties of undefined (reading 'getValue')`
- :beetle: virtual mouse pointer state and locators added with `I define ... as ... locator` are scoped to the scenario instead of leaking into later scenarios of the worker
- :beetle: `I expect every element in ... collection {state}` no longer reads the non-existent `config.browser.timeout.page`
- :beetle: `I click ... coordinates in ...` awaits the memory value
- :beetle: `I close current tab` switches to the tab opened before the closed one instead of always the first tab
- :beetle: `I save value of ... cookie as ...` uses the WebdriverIO v10 `getCookies` filter object
- :beetle: drag and drop sets `ctrlKey` (was `ctlrKey`) and sets screen coordinates for `0` offsets
- :x: `{word} storage` steps accept only `local` and `session`
- :x: the package re-exports webdriverio types plus `Key` and `SevereServiceError` only, instead of all of webdriverio (`remote`, `attach`, `multiRemote` are no longer re-exported)
- :pencil: update dependencies (`@playwright/test` 1.65.0, `@qavajs/playwright-runner-adapter` 2.7.0, `@qavajs/playwright-wdio-fixtures` 2.1.0, `webdriverio` 10.2.0, `@types/node` 26.6.6, `express` 5.3.0, `tsx` 4.23.15)
- :pencil: add Biome lint, `node:test` unit tests, Dependabot; CI runs on pushes to `main`, publish runs tests and uses npm trusted publishing (no npm token), CI e2e runs without retries
- :pencil: deduplicate page object chain resolution; type `this` in all step definitions; remove the unused electron feature

## [1.3.0]
- :rocket: waiting validations contribute a single trace record instead of one per retry attempt
  - `expect.poll()` invokes the matcher — and therefore opens a step — once per attempt, and the WebdriverIO commands its getter issued were reported as well, so `I expect text of 'Loading' to equal '100%'` left 19 records in the trace where 2 suffice: an expect step, a command step and a stdout line for every retry. Validations now run their own retry loop with command reporting suppressed, keeping playwright's `[100, 250, 500, 1000]` intervals and the configured expect timeout, and assert once on the value they settled on
  - the matcher still decides pass or fail, so `toEqual` diffs are unchanged; a per-validation predicate only decides when waiting stops. A predicate throws wherever its matcher would refuse the value outright — `toMatch` on an attribute that is still `null` — which keeps the validation polling whatever its polarity, the way `expect.poll` retried through such an error
  - a validation that runs out of time reports `Timed out <timeout>ms waiting for value <condition>` above the matcher output. The elapsed wait is now carried by the enclosing step rather than by the expect record
- :rocket: page object logs a resolved locator chain once per step instead of once per resolution, so a waiting validation no longer repeats `Loading -> $('#loading')` for every attempt
- :beetle: fixed `case insensitive equal` always throwing in waiting validations, where `toLowerCase()` was called on the value getter instead of on the resolved value
- :beetle: a validation that is not implemented (e.g. `have members`) reports `<condition> expect is not implemented` instead of `expectFn is not a function`
- :pencil: update dependencies (`@qavajs/playwright-wdio-fixtures` 1.4.0, which provides the `withoutSteps` helper the retry loop needs)

## [1.2.0]
- :pencil: update dependencies (`@playwright/test` 1.63.0, `@qavajs/playwright-runner-adapter` 2.3.3, `@qavajs/playwright-wdio-fixtures` 1.3.0, `webdriverio` 9.31.9, `@types/node` 26.6.2, `typescript` 7.0.2)
- :pencil: replace `ts-node` with `tsx` to run test e2e server

## [1.1.0]
- :pencil: update dependencies (`@playwright/test` 1.59.1, `@qavajs/memory` 1.11.0, `@qavajs/playwright-runner-adapter` 2.3.0, `@qavajs/playwright-wdio-fixtures` 1.2.0, `webdriverio` 9.27.0, `typescript` 6.0.3)
- :pencil: add `rootDir` to tsconfig.json

## [1.0.0]
- :rocket: release 1.0.0

## [0.0.3]
- :rocket: moved main declarations to package json
- :beetle: added exports of `MemoryValue` and `Validation` types

## [0.0.2]
- :rocket: update dependencies

## [0.0.1]
- :rocket: initial implementation