import { TestWorld } from '@qavajs/playwright-runner-adapter';
import { test } from '@qavajs/playwright-wdio-fixtures';
import memory from '@qavajs/memory';
import { expect } from './validationExpect';
import { element } from './pageObject';
import type { Browser } from 'webdriverio';
import type { APIRequestContext } from '@playwright/test';

export class QavajsPlaywrightWdioWorld extends TestWorld {
    test = test;
    config: any;
    memory!: typeof memory;
    driver!: Browser;
    request!: APIRequestContext;
    expect = expect;
    element = element;

    constructor(options: any) {
        super(options);
        this.config = options.config;
        if (this.config?.memory) {
            memory.register(this.config.memory);
            memory.setLogger(this);
            this.memory = memory;
        }
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
