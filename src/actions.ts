import { When } from '@qavajs/playwright-runner-adapter';
import { QavajsPlaywrightWdioWorld } from './QavajsPlaywrightWdioWorld';
import { parseCoords, parseCoordsAsObject, parseKeySequence, dragAndDrop } from './utils/utils';
import { MemoryValue } from './types';
import { Locator } from './pageObject';

/**
 * Opens provided url
 * @param {string} url - url to navigate
 * @example I open 'https://google.com'
 */
When('I open {value} url', async function (this: QavajsPlaywrightWdioWorld, url: MemoryValue) {
    await this.driver.url(await url.value());
});

/**
 * Type text to element
 * @param {string} alias - element to type
 * @param {string} value - value to type
 * @example I type 'wikipedia' to 'Google Input'
 * @example I type 'wikipedia' into 'Google Input'
 */
When('I type {value} (in)to {locator}', async function (this: QavajsPlaywrightWdioWorld, typeValue: MemoryValue, element: Locator) {
    await element().addValue(await typeValue.value());
});

/**
 * Type text to element sending fine-grained keyboard events
 * @param {string} alias - element to type
 * @param {string} value - value to type
 * @example I type 'wikipedia' chars to 'Google Input'
 * @example I type 'wikipedia' chars into 'Google Input'
 */
When('I type {value} chars (in)to {locator}', async function (this: QavajsPlaywrightWdioWorld, typeValue: MemoryValue, element: Locator) {
    await element().click();
    await this.driver.keys(await typeValue.value());
});

/**
 * Click element
 * @param {string} alias - element to click
 * @param {boolean} [disableWait] - disable wait before click
 * @example I click 'Google Button'
 */
When('I click {locator}', async function (this: QavajsPlaywrightWdioWorld, element: Locator) {
    await element().click();
});

/**
 * Double click element
 * @param {string} alias - double element to click
 * @param {boolean} [disableWait] - disable wait before click
 * @example I double click 'Google Button'
 */
When('I double click {locator}', async function (this: QavajsPlaywrightWdioWorld, element: Locator) {
    await element().doubleClick();
});

/**
 * Right click element
 * @param {string} alias - element to right-click
 * @param {boolean} [disableWait] - disable wait before click
 * @example I right click 'Google Button'
 */
When('I right click {locator}', async function (this: QavajsPlaywrightWdioWorld, element: Locator) {
    await element().click({ button: 'right' });
});

/**
 * Click element via script
 * @param {string} alias - element to click
 * @example I force click 'Google Button'
 */
When('I force click {locator}', async function (this: QavajsPlaywrightWdioWorld, element: Locator) {
    await this.driver.execute((e: HTMLElement) => e.click(), await element().getElement());
});

/**
 * Clear input
 * @param {string} alias - element to clear
 * @example I clear 'Google Input'
 */
When('I clear {locator}', async function (this: QavajsPlaywrightWdioWorld, element: Locator) {
    await element().clearValue();
});

/**
 * Click on element with desired text in collection
 * @param {string} expectedText - text to click
 * @param {string} alias - collection to search text
 * @example I click 'google' text in 'Search Engines' collection
 */
When(
    'I click {value} text in {locator} collection',
    async function (this: QavajsPlaywrightWdioWorld, value: MemoryValue, locator: Locator) {
        const collection = locator.collection();
        const expectedText = await value.value();
        for (const element of await collection.getElements()) {
            const text = await element.getText();
            if (text === await expectedText) {
                return element.click();
            }
        }
        throw new Error(`text '${expectedText}' is not found in collection`);
    });

/**
 * Switch to parent frame
 * @example I switch to parent frame
 */
When('I switch to parent frame', async function (this: QavajsPlaywrightWdioWorld, ) {
    await this.driver.switchFrame(null);
});

/**
 * Switch to frame by index
 * @param {number} index - index to switch
 * @example I switch to 2 frame
 */
When('I switch to {int} frame', async function (this: QavajsPlaywrightWdioWorld, index: number) {
    const frame = this.driver.$$('iframe, frame')[index - 1];
    await this.driver.switchFrame(frame);
});

/**
 * Switch to frame by alias
 * @param {string} alias - po alias
 * @example I switch to 'Checkout Iframe' frame
 */
When('I switch to {locator} frame', async function (this: QavajsPlaywrightWdioWorld, element: Locator) {
    await this.driver.switchFrame(element());
});

/**
 * Switch to window by index
 * @param {number} index - index to switch
 * @example I switch to 2 window
 */
When('I switch to {int} window', async function (this: QavajsPlaywrightWdioWorld, index: number) {
    await this.driver.waitUntil(
        async () => (await this.driver.getWindowHandles()).length >= index,
        { timeout: this.config.timeout }
    );
    const windowHandles = await this.driver.getWindowHandles();
    await this.driver.switchToWindow(windowHandles[index - 1]);
});

/**
 * Switch to window by text
 * @param {string} matcher - window matcher (url or title)
 * @example I switch to 'google.com' window
 */
When('I switch to {value} window', async function (this: QavajsPlaywrightWdioWorld, matcher: MemoryValue) {
    const urlOrTitle = await matcher.value()
    await this.driver.waitUntil(
        async () => {
            try {
                await this.driver.switchWindow(urlOrTitle);
                return true
            } catch (err) {
                return false
            }
        },
        {
            timeout: this.config.timeout,
            timeoutMsg: `Page matching ${urlOrTitle} was not found`,
            interval: 500
        }
    );
});

/**
 * Refresh current page
 * @example I refresh page
 */
When('I refresh page', async function (this: QavajsPlaywrightWdioWorld, ) {
    await this.driver.refresh();
});

/**
 * Press button
 * @param {string} key - key to press
 * @example I press 'Enter' key
 * @example I press 'Ctrl+C' keys
 */
When('I press {value} key(s)', async function (this: QavajsPlaywrightWdioWorld, key: MemoryValue) {
    const keySequence: string | string[] = await key.value();
    const keys = parseKeySequence(keySequence);
    await this.driver.keys(keys);
});

/**
 * Press button given number of times
 * @param {string} key - key to press
 * @param {number} num - number of times
 * @example I press 'Enter' key 5 times
 * @example I press 'Ctrl+V' keys 4 times
 */
When('I press {value} key(s) {int} time(s)', async function (this: QavajsPlaywrightWdioWorld, key: MemoryValue, num: number) {
    const keySequence: string | string[] = await key.value();
    const keys = parseKeySequence(keySequence);
    for (let i: number = 0; i < num; i++) {
        await this.driver.keys(keys);
    }
});

/**
 * Select option with certain text from select element
 * @param {string} option - option to select
 * @param {string} alias - alias of select
 * @example I select '1900' option from 'Registration Form > Date Of Birth'
 * @example I select '$dateOfBirth' option from 'Registration Form > Date Of Birth' dropdown
 */
When('I select {value} option from {locator} dropdown', async function (this: QavajsPlaywrightWdioWorld, option: MemoryValue, select: Locator) {
    await select().selectByVisibleText(await option.value())
});

/**
 * Select option with certain text from select element
 * @param {number} optionIndex - index of option to select
 * @param {string} alias - alias of select
 * @example I select 1 option from 'Registration Form > Date Of Birth' dropdown
 */
When('I select {int}(st|nd|rd|th) option from {locator} dropdown', async function (this: QavajsPlaywrightWdioWorld, optionIndex: number, select: Locator) {
    await select().selectByIndex(optionIndex - 1)
});

/**
 * Scroll to element
 * @param {string} alias - alias of element
 * @example I scroll to 'Element'
 */
When('I scroll to {locator}', async function (this: QavajsPlaywrightWdioWorld, element: Locator) {
    await this.driver.execute((element: HTMLElement) => element.scrollIntoView(), await element().getElement())
});

/**
 * Click browser button
 * @param {string} button - browser button
 * @example I click back button
 * @example I click forward button
 */
When('I click {browserButton} button', async function (this: QavajsPlaywrightWdioWorld, button: 'back' | 'forward') {
    await this.driver[button]();
});

/**
 * Scroll by provided offset
 * @param {string} - offset string in 'x, y' format
 * @example
 * When I scroll by '0, 100'
 */
When('I scroll by {value}', async function (this: QavajsPlaywrightWdioWorld, offset: MemoryValue) {
    const [deltaX, deltaY] = parseCoords(await offset.value());
    await this.driver.action('wheel').scroll({
        deltaX,
        deltaY,
        duration: 100
    }).perform();
});

/**
 * Scroll by provided offset in element
 * @param {string} - offset string in 'x, y' format
 * @param {string} - element alias
 * @example
 * When I scroll by '0, 100' in 'Overflow Container'
 */
When('I scroll by {value} in {locator}', async function (this: QavajsPlaywrightWdioWorld, offset: MemoryValue, container: Locator) {
    const [deltaX, deltaY] = parseCoords(await offset.value());
    await container().moveTo();
    await this.driver.action('wheel').scroll({
        deltaX,
        deltaY,
        duration: 100,
        origin: container()
    }).perform();
});

/**
 * Scroll until specified element to be visible
 * @param {string} - target element
 * @example
 * When I scroll until 'Row 99' becomes visible
 */
When('I scroll until {locator} to be visible', async function (this: QavajsPlaywrightWdioWorld, element: Locator) {
    const isVisible = async () => element().isDisplayed();
    while (!await isVisible()) {
        await this.driver.action('wheel').scroll({
            deltaX: 0,
            deltaY: 100,
            duration: 100
        }).perform();
        await this.driver.pause(100);
    }
});

/**
 * Scroll in container until specified element to be visible
 * @param {string} - scroll container
 * @param {string} - target element
 * @example
 * When I scroll in 'List' until 'Row 99' to be visible
 */
When('I scroll in {locator} until {locator} to be visible', async function (this: QavajsPlaywrightWdioWorld, origin: Locator, element: Locator) {
    const isVisible = async () => element().isDisplayed();
    while (!await isVisible()) {
        await this.driver.action('wheel').scroll({
            deltaX: 0,
            deltaY: 100,
            duration: 100,
            origin: origin()
        }).perform();
        await this.driver.pause(50);
    }
});

/**
 * Provide file url to upload input
 * @param {string} alias - element to upload file
 * @param {string} value - file path
 * @example I upload '/folder/file.txt' to 'File Input'
 */
When('I upload {value} file to {locator}', async function (this: QavajsPlaywrightWdioWorld, value: MemoryValue, element: Locator) {
    await element().setValue(await value.value());
});

/**
 * Drag&Drop one element to another
 * @param {string} elementAlias - element to drag
 * @param {string} targetAlias - target
 * @example I drag and drop 'Bishop' to 'E4'
 */
When('I drag and drop {locator} to {locator}', async function (this: QavajsPlaywrightWdioWorld, element: Locator, target: Locator) {
    await this.driver.execute(dragAndDrop, await element().getElement(), await target().getElement());
});

/**
 * Open new browser tab
 * @example I open new tab
 */
When('I open new tab', async function (this: QavajsPlaywrightWdioWorld, ) {
    await this.driver.execute(() => { window.open('about:blank', '_blank') });
});

/**
 * Click certain coordinates in element
 * @param {string} coords - x, y coordinates to click
 * @param {string} alias - element to click
 * @param {boolean} [disableWait] - disable wait before click
 * @example When I click '0, 20' coordinates in 'Element'
 * @example When I click '0, 20' coordinates in 'Element' (disable actionability wait)
 */
When('I click {value} coordinates in {locator}', async function (this: QavajsPlaywrightWdioWorld, coordinates: MemoryValue, element: Locator) {
    const coords = coordinates.value();
    const coordsObject = typeof coords === 'string' ? parseCoordsAsObject(coords) : coords;
    const width = await element().getSize('width');
    const height = await element().getSize('height');
    coordsObject.x -= Math.floor(width / 2);
    coordsObject.y -= Math.floor(height / 2);
    await element().click(coordsObject);
});

/**
 * Resize browser's window
 * @param {string} size - desired size
 * @example I set window size '1366,768'
 */
When('I set window size {value}', async function (this: QavajsPlaywrightWdioWorld, size: MemoryValue) {
    const {x, y} = parseCoordsAsObject(await size.value());
    await this.driver.setWindowSize(x, y);
});

/**
 * Close current browser tab/window
 * @example I close current tab
 */
When('I close current tab', async function (this: QavajsPlaywrightWdioWorld, ) {
    await this.driver.closeWindow();
    const windowHandles = await this.driver.getWindowHandles();
    await this.driver.switchToWindow(windowHandles[0]);
});