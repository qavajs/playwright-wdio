# Change Log

All notable changes to the "@qavajs/playwright-wdio" will be documented in this file.

Check [Keep a Changelog](http://keepachangelog.com/) for recommendations on how to structure this file.

:rocket: - new feature  
:beetle: - bugfix  
:x: - deprecation/removal  
:pencil: - chore  
:microscope: - experimental

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