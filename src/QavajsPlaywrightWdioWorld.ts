import { TestWorld } from '@qavajs/playwright-runner-adapter';
import { test } from '@qavajs/playwright-wdio-fixtures';
import memory from '@qavajs/memory';
import { expect } from './validationExpect';
import { element } from './pageObject';
import { VirtualPointer } from './utils';
import type { Browser } from 'webdriverio';
import type { APIRequestContext } from '@playwright/test';

export type QavajsPlaywrightWdioConfig = TestWorld['config'] & {
    /** Memory instance (or class) registered in `@qavajs/memory` */
    memory?: object;
    /** Root page object: an instance or a class */
    pageObject?: any;
    /** Timeout (ms) for steps that wait on their own, e.g. window switching and scrolling until visible */
    timeout?: number;
};

/**
 * Each scenario resolves locators against its own child of the configured page object,
 * so locators added with `I define ... locator` do not leak into other scenarios of the worker.
 */
function scenarioPageObject(root: any) {
    if (!root) return root;
    return Object.create(typeof root === 'function' ? new root() : root);
}

export class QavajsPlaywrightWdioWorld extends TestWorld {
    test = test;
    declare config: QavajsPlaywrightWdioConfig;
    memory: typeof memory = memory;
    driver!: Browser;
    request!: APIRequestContext;
    expect = expect;
    element = element;
    pageObject: any;
    virtualPointer = new VirtualPointer();
    /**
     * Frame or tab selected by the switch steps in a WebDriver BiDi session, where WebdriverIO no longer
     * moves the session between frames. Undefined means the session's own tab (and always in Classic).
     */
    browsingContext?: WebdriverIO.BrowsingContext;

    /** Where element lookups, scripts and input actions run: the selected frame/tab, or the browser */
    get target(): WebdriverIO.Browser | WebdriverIO.BrowsingContext {
        return this.browsingContext ?? this.driver;
    }

    /** Send keys to the selected frame/tab */
    keys(value: string | string[]) {
        return this.browsingContext ? this.browsingContext.keys(value) : this.driver.keys(value);
    }

    /** Top-level tab of the selection, for url, title and navigation */
    get tab(): WebdriverIO.Browser | WebdriverIO.BrowsingContext {
        let context = this.browsingContext;
        while (context?.parent) context = context.parent;
        return context ?? this.driver;
    }

    constructor(options: any) {
        super(options);
        if (this.config?.memory) {
            memory.register(this.config.memory);
            memory.setLogger(this);
        }
        this.pageObject = scenarioPageObject(this.config?.pageObject);
    }

    value(expression: string): any {
        return this.memory.getValue(expression);
    }

    setValue(key: string, value: any) {
        this.memory.setValue(key, value);
    }

    init = ({ driver, request }: { driver: Browser, request: APIRequestContext }) => {
        this.driver = driver;
        this.request = request;
    }
}
