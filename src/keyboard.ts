import type { QavajsPlaywrightWdioWorld } from './QavajsPlaywrightWdioWorld';
import { When } from '@qavajs/playwright-runner-adapter';
import { parseKeySequence } from './utils';

/**
 * Press and hold keyboard key
 * @param {string} key - key to press
 * @example When I hold down 'Q' key
 */
When('I hold down {string} key', async function (this: QavajsPlaywrightWdioWorld, key) {
    const [keyToPress] = parseKeySequence(key);
    await this.target.action('key').down(keyToPress).perform(true);
});

/**
 * Release keyboard key
 * @param {string} key - key to release
 * @example When I release 'A' key
 */
When('I release {string} key', async function (this: QavajsPlaywrightWdioWorld, key) {
    const [keyToPress] = parseKeySequence(key);
    await this.target.action('key').up(keyToPress).perform();
});