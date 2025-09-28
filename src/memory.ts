import type { Locator } from './pageObject';
import {DataTable, When} from '@qavajs/playwright-runner-adapter';
import type { MemoryValue } from './types';
import { dataTable2Object } from './utils/utils';

/**
 * Save text of element to memory
 * @param {string} alias - element to get value
 * @param {string} key - key to store value
 * @example I save text of 'Search Result (1)' as 'firstSearchResult'
 */
When('I save text of {locator} as {value}', async function (element: Locator, key: MemoryValue) {
    key.set(await element().getText());
});

/**
 * Save property of element to memory
 * @param {string} property - property to store
 * @param {string} alias - element to get value
 * @param {string} key - key to store value
 * @example I save 'checked' property of 'Checkbox' as 'checked'
 * @example I save '$prop' property of 'Checkbox' as 'checked'
 */
When('I save {value} property of {locator} as {value}', async function (property: MemoryValue, element: Locator, key: MemoryValue) {
    const propertyName = await property.value();
    key.set(await element().getProperty(propertyName));
});

/**
 * Save attribute of element to memory
 * @param {string} attribute - attribute to store
 * @param {string} alias - element to get value
 * @param {string} key - key to store value
 * @example I save 'href' attribute of 'Link' as 'linkHref'
 * @example I save '$prop' attribute of 'Link' as 'linkHref'
 */
When('I save {value} attribute of {locator} as {value}', async function (attribute: MemoryValue, element: Locator, key: MemoryValue) {
    const attributeName = await attribute.value();
    key.set(await element().getAttribute(attributeName));
});

/**
 * Save number of elements in collection to memory
 * @param {string} alias - collection to get value
 * @param {string} key - key to store value
 * @example I save number of elements in 'Search Results' as 'numberOfSearchResults'
 */
When('I save number of elements in {locator} collection as {value}', async function (locator: Locator, key: MemoryValue) {
    key.set(await locator.collection().length)
});

/**
 * Save array of texts of collection to memory
 * @param {string} alias - collection to get values
 * @param {string} key - key to store value
 * @example I save text of every element of 'Search Results' collection as 'searchResults'
 */
When(
    'I save text of every element of {locator} collection as {value}',
    async function (locator: Locator, key: MemoryValue) {
        const values = await locator.collection().map(element => element.getText());
        key.set(values);
    }
);

/**
 * Save array of attributes of collection to memory
 * @param {string} alias - collection to get values
 * @param {string} key - key to store value
 * @example I save 'checked' attribute of every element of 'Search > Checkboxes' collection as 'checkboxes'
 */
When(
    'I save {value} attribute of every element of {locator} collection as {value}',
    async function (attribute: MemoryValue, locator: Locator, key: MemoryValue) {
        const attributeName = await attribute.value();
        const values = await locator.collection().map(element => element.getAttribute(attributeName));
        key.set(values);
    }
);

/**
 * Save array of property of collection to memory
 * @param {string} alias - collection to get values
 * @param {string} key - key to store value
 * @example I save 'href' property of every element of 'Search > Links' collection as 'hrefs'
 */
When(
    'I save {value} property of every element of {locator} collection as {value}',
    async function (property: MemoryValue, locator: Locator, key: MemoryValue) {
        const propertyName = await property.value();
        const values = await locator.collection().map(element => element.getProperty(propertyName));
        key.set(values);
    }
);

/**
 * Save current url to memory
 * @param {string} key - key to store value
 * @example I save current url as 'currentUrl'
 */
When('I save current url as {value}', async function (key: MemoryValue) {
    const url = await this.driver.getUrl();
    key.set(url);
});

/**
 * Save current page title to memory
 * @param {string} key - key to store value
 * @example I save page title as 'currentTitle'
 */
When('I save page title as {value}', async function (key: MemoryValue) {
    const title = await this.driver.getTitle();
    key.set(title);
});

/**
 * Save page screenshot into memory
 * @param {string} key - key to store value
 * @example I save screenshot as 'screenshot'
 */
When('I save screenshot as {value}', async function(key: MemoryValue) {
    const screenshot = await this.driver.takeScreenshot();
    key.set(screenshot);
});

/**
 * Save element screenshot into memory
 * @param {string} alias - element to get screenshot
 * @param {string} key - key to store value
 * @example I save screenshot of 'Header > Logo' as 'screenshot'
 */
When('I save screenshot of {locator} as {value}', async function(locator: Locator, key: MemoryValue) {
    const screenshot = await this.driver.takeElementScreenshot(await locator().elementId);
    key.set(screenshot);
});

/**
 * Save css property of element to memory
 * @param {string} property - css property to store
 * @param {string} alias - element to get value
 * @param {string} key - key to store value
 * @example I save 'color' css property of 'Checkbox' as 'checkboxColor'
 * @example I save '$propertyName' property of 'Checkbox' as 'checkboxColor'
 */
When('I save {value} css property of {locator} as {value}', async function (property: MemoryValue, locator: Locator, key: MemoryValue) {
    const propertyName = await property.value();
    const value = await this.driver.execute(function (element: WebdriverIO.Element, propertyName: string) {
        return getComputedStyle(element as any).getPropertyValue(propertyName)
    }, await locator().getElement(), propertyName);
    key.set(value);
});

/**
 * Save bounding client rect to memory
 * https://developer.mozilla.org/en-US/docs/Web/API/DOMRect
 * @param {string} alias - element to get value
 * @param {string} key - key to store value
 * @example
 * When I save bounding rect of 'Node' as 'boundingRect'
 * Then I expect '$boundingRect.width' to equal '42'
 */
When('I save bounding rect of {locator} as {value}', async function (locator: Locator, key: MemoryValue) {
    const value = await this.driver.execute(function (element: HTMLElement) {
        return JSON.stringify(element.getBoundingClientRect());
    }, await locator().getElement());
    key.set(JSON.parse(value));
});


/**
 * Save value to memory
 * @param {string} alias - value to save or alias for previously saved value
 * @param {string} key - key to store value
 * @example I save 'value' to memory as 'key'
 * @example I save '$getRandomUser()' to memory as 'user'
 */
When(
    'I save {value} to memory as {value}',
    async function (expression: MemoryValue, key: MemoryValue) {
        key.set(await expression.value());
    }
);

When(
    'I save multiline string to memory as {value}:',
    async function (key: MemoryValue, multilineString: string) {
        const value: string = await this.value(multilineString);
        key.set(value);
    }
);

/**
 * Save value to memory
 * @param {string} key - key to store value
 * @param {string} value - value to save or alias for previously saved value
 * @example I set 'key' = 'value'
 */
When(
    'I set {value} = {value}',
    async function (key: MemoryValue, expression: MemoryValue) {
        key.set(await expression.value());
    }
);

/**
 * Save json value to memory
 * @param {string} key - key to store value
 * @param {string} json - multiline string
 * @example I save json to memory as 'key':
 * """
 * {
 *     "someKey": "someValue"
 * }
 * """
 */
When(
    'I save json to memory as {value}:',
    async function (key: MemoryValue, json: string) {
        const value: string = await this.value(json);
        key.set(JSON.parse(value));
    }
);

/**
 * Save key-value pairs to memory
 * @param {string} key - key to store value
 * @param {string} kv - key-value
 * @example I save key-value pairs to memory as 'key':
 * | someKey      | 42               |
 * | someOtherKey | $valueFromMemory |
 */
When(
    'I save key-value pairs to memory as {value}:',
    async function (key: MemoryValue, kv: DataTable) {
        const value = await dataTable2Object(this as any, kv);
        key.set(value);
    }
);