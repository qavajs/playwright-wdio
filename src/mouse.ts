import { parseCoords } from './utils';
import type { Locator } from './pageObject';
import { When } from '@qavajs/playwright-runner-adapter';
import type { MemoryValue } from './types';
import type { QavajsPlaywrightWdioWorld } from './QavajsPlaywrightWdioWorld';

type MouseButton = 'left' | 'right' | 'middle';

/**
 * Hover over element
 * @param {string} alias - element to hover over
 * @example I hover over 'Google Button'
 */
When('I hover over {locator}', async function (this: QavajsPlaywrightWdioWorld, element: Locator) {
    await element().moveTo();
    this.virtualPointer.hover(await element().getElement());
});

/**
 * Press mouse button
 * @param {string} button - button to press (left, right, middle)
 * @example When I press left mouse button
 */
When('I press {mouseButton} mouse button', async function (this: QavajsPlaywrightWdioWorld, button: MouseButton) {
    await this.driver
        .action('pointer')
        .move({ ...this.virtualPointer.pointer() })
        .down(button)
        .perform(true);
});

/**
 * Release mouse button
 * @param {string} button - button to release (left, right, middle)
 * @example When I release left mouse button
 */
When('I release {mouseButton} mouse button', async function (this: QavajsPlaywrightWdioWorld, button: MouseButton) {
    await this.driver
        .action('pointer')
        .move({ ...this.virtualPointer.pointer() })
        .up(button)
        .perform(true);
});

/**
 * Move mouse to coordinates
 * @param {string} coords - x, y coordinates to move
 * @example When I move mouse to '10, 15'
 */
When('I move mouse to {value}', async function (this: QavajsPlaywrightWdioWorld, coords: MemoryValue) {
    const [x, y] = parseCoords(await coords.value());
    this.virtualPointer.move(x, y);
    await this.driver
        .action('pointer')
        .move({ ...this.virtualPointer.pointer() })
        .perform(true);
});

/**
 * Scroll mouse wheel by x, y offset
 * @param {string} coords - x, y offset to scroll
 * @example When I scroll mouse wheel by '0, 15'
 */
When('I scroll mouse wheel by {value}', async function (this: QavajsPlaywrightWdioWorld, offset: MemoryValue) {
    const [deltaX, deltaY] = parseCoords(await offset.value());
    await this.driver
        .action('wheel')
        .scroll({
            deltaX,
            deltaY,
            duration: 100,
            ...this.virtualPointer.wheel()
        })
        .perform(true);
});
