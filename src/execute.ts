import type { QavajsPlaywrightWdioWorld } from './QavajsPlaywrightWdioWorld';
import { When } from '@qavajs/playwright-runner-adapter';
import type { Locator } from './pageObject';
import type { MemoryValue } from './types';

type ClientFunction = (...args: any[]) => any;

/** A string script becomes a function body, so it needs an explicit `return` to produce a result */
function resolveFunction(script: string | ClientFunction): ClientFunction {
    return typeof script === 'function' ? script : new Function(script) as ClientFunction;
}
/**
 * Execute client function
 * @param {string} functionKey - memory key of function
 * @example I execute '$fn' function // fn is function reference
 * @example I execute 'window.scrollBy(0, 100)' function
 */
When('I execute {value} function/script', async function (this: QavajsPlaywrightWdioWorld, functionKey: MemoryValue) {
    const fn = resolveFunction(await functionKey.value());
    await this.target.execute(fn);
});

/**
 * Execute client function and save result into memory
 * @param {string} functionKey - memory key of function
 * @param {string} memoryKey - memory key to store result
 * @example I execute '$fn' function and save result as 'result' // fn is function reference
 * @example I execute 'return window.scrollY' function and save result as 'scroll'
 */
When('I execute {value} function/script and save result as {value}', async function (this: QavajsPlaywrightWdioWorld, functionKey: MemoryValue, memoryKey: MemoryValue) {
    const fn = resolveFunction(await functionKey.value());
    memoryKey.set(await this.target.execute(fn));
});

/**
 * Execute client function on certain element
 * @param {string} functionKey - memory key of function
 * @param {string} alias - alias of target element
 * @example I execute '$fn' function on 'Component > Element' // fn is function reference
 * @example I execute 'arguments[0].scrollIntoView()' function on 'Component > Element'
 */
When('I execute {value} function/script on {locator}', async function (this: QavajsPlaywrightWdioWorld, functionKey: MemoryValue, locator: Locator) {
    const fn = resolveFunction(await functionKey.value());
    const element = locator();
    await this.target.execute(fn, await element.getElement());
});

/**
 * Execute client function on certain element
 * @param {string} functionKey - memory key of function
 * @param {string} alias - alias of target element
 * @example I execute '$fn' function on 'Component > Element' and save result as 'innerText' // fn is function reference
 * @example I execute 'arguments[0].innerText' function on 'Component > Element' and save result as 'innerText'
 */
When(
    'I execute {value} function/script on {locator} and save result as {value}',
    async function (this: QavajsPlaywrightWdioWorld, functionKey: MemoryValue, locator: Locator, memoryKey: MemoryValue) {
        const fn = resolveFunction(await functionKey.value());
        const element = locator();
        memoryKey.set(await this.target.execute(fn, await element.getElement()));
    }
);