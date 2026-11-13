import { When } from '@qavajs/playwright-runner-adapter';
import type { MemoryValue } from './types';
import type { QavajsPlaywrightWdioWorld } from './QavajsPlaywrightWdioWorld';

type StorageType = 'local' | 'session';

/**
 * Set cookie
 * @param {string} cookie - cookie name
 * @param {string} value - value to set
 * @example I set 'userID' cookie 'user1'
 * @example I set 'userID' cookie '$userIdCookie'
 */
When('I set {value} cookie as {value}', async function (this: QavajsPlaywrightWdioWorld, cookie: MemoryValue, value: MemoryValue) {
    const cookieValue = await value.value();
    const cookieObject = typeof cookieValue === 'object' ? cookieValue : { value: cookieValue };
    await this.driver.setCookies([{ name: await cookie.value(), ...cookieObject }]);
});

/**
 * Save cookie value to memory
 * @param {string} cookie - cookie name
 * @param {string} key - memory key
 * @example I save value of 'auth' cookie as 'authCookie'
 */
When('I save value of {value} cookie as {value}', async function (this: QavajsPlaywrightWdioWorld, cookie: MemoryValue, key: MemoryValue) {
    const cookies = await this.driver.getCookies({ name: await cookie.value() });
    key.set(cookies.pop());
});

/**
 * Set value of local/session storage
 * @param {string} storageKey - local/session storage key to set value
 * @param {string} storageType - storage type (local or session)
 * @param {string} value - value to set
 * @example I set 'username' local storage value as 'user1'
 * @example I set '$sessionStorageKey' session storage value as '$sessionStorageValue'
 */
When('I set {value} {storageType} storage value as {value}', async function (this: QavajsPlaywrightWdioWorld, storageKey: MemoryValue, storageType: StorageType, value: MemoryValue) {
    await this.target.execute<void, [string, StorageType, unknown]>(function (storageKey, storageType, value) {
        window[`${storageType}Storage` as const].setItem(storageKey, String(value));
    }, await storageKey.value(), storageType, await value.value());
});

/**
 * Save value of local/session storage to memory
 * @param {string} storageKey - local/session storage key to set value
 * @param {string} storageType - storage type (local or session)
 * @param {string} key - memory key
 * @example I save value of 'username' local storage as 'localStorageValue'
 * @example I save value of '$sessionStorageKey' session storage value as 'sessionStorageValue'
 */
When('I save value of {value} {storageType} storage as {value}', async function (this: QavajsPlaywrightWdioWorld, storageKey: MemoryValue, storageType: StorageType, key: MemoryValue) {
    const value = await this.target.execute<string | null, [string, StorageType]>(function (storageKey, storageType) {
        return window[`${storageType}Storage` as const].getItem(storageKey);
    }, await storageKey.value(), storageType);
    key.set(value);
});
