import type { ChainablePromiseArray, ChainablePromiseElement } from 'webdriverio';

type ComponentConstructor = new () => object;
type SelectorDefinition = string | ((argument: string) => string) | ((argument: any) => any) | null;

class Selector {
    selector: SelectorDefinition;
    component!: ComponentConstructor;
    type: string = 'simple';

    constructor(selector: SelectorDefinition, type?: string) {
        this.selector = selector;
        if (type) {
            this.type = type;
        }
    }

    /**
     * Define current locator as component
     * @param { ComponentConstructor } component
     */
    as(component: ComponentConstructor) {
        this.component = component;
        return this;
    }
}

export type NativeSelectorParams = {
    browser: WebdriverIO.Browser;
    driver: WebdriverIO.Browser;
    parent: ChainablePromiseElement;
    argument: string;
};

/**
 * Define selector
 */
export interface LocatorDefinition {
    (selector: any): Selector;

    /**
     * Define selector as a template
     * @param {(argument: string) => string} selector - selector template
     */
    template: (selector: (argument: string) => string) => Selector;

    /**
     * Define selector using native wdio API
     * @param {(argument: string) => string} selector - selector function
     */
    native: (selector: (params: NativeSelectorParams) => ChainablePromiseElement) => Selector;

    /**
     * Define component
     * @param { ComponentConstructor } component
     */
    as: (component: ComponentConstructor) => Selector;
}

export const locator: LocatorDefinition = function locator(selector: any): Selector {
    return new Selector(selector);
}

locator.template = function(selector: (argument: string) => string) {
    return new Selector(selector, 'template');
}

locator.native = function(selector: (params: NativeSelectorParams) => ChainablePromiseElement) {
    return new Selector(selector, 'native');
}

locator.as = function (component: ComponentConstructor) {
    const selector = new Selector(null);
    selector.component = component;
    return selector;
}

export class ChainItem {
    alias: string;
    argument?: string;
    selector: any;
    type: string;

    constructor({ alias, argument, selector, type }: { alias: string, argument?: string, selector?: string, type: string }) {
        this.alias = alias;
        this.argument = argument;
        this.selector = selector;
        this.type = type;
    }
}

export function query(root: any, path: string) {
    const elements = path.split(/\s*>\s*/);
    const tokens = [];
    let currentComponent = typeof root === 'function' ? new root() : root;
    let currentAlias = 'App';
    for (const element of elements) {
        const groups = element.match(/^(?<alias>.+?)(?:\((?<argument>.+)\))?$/)?.groups as { alias: string, argument: string };
        const alias = groups.alias.replace(/\s/g, '');
        if (!currentComponent) throw new Error(`Alias '${currentAlias}' is not a component`);
        let currentElement = currentComponent[alias];
        if (!currentElement && (!currentComponent.defaultResolver || typeof currentComponent.defaultResolver !== 'function')) {
            throw new Error(`Alias '${alias}' has not been found in '${currentAlias}'`);
        }
        if (!currentElement && currentComponent.defaultResolver) {
            currentElement = {};
            currentElement.selector = currentComponent.defaultResolver({ alias: groups.alias, argument: groups.argument });
            currentElement.type = 'native';
        }
        currentAlias = groups.alias;
        currentComponent = currentElement.component ? new currentElement.component() : null;

        tokens.push(new ChainItem({
            alias,
            argument: groups.argument,
            selector: currentElement.selector,
            type: currentElement.type,
        }));
    }

    return tokens;
}

export interface Locator {
    (): ChainablePromiseElement;
    collection: () => ChainablePromiseArray;
}

export function element(this: any, path: string): Locator {
    const chain = query(this.pageObject ?? this.config.pageObject, path);
    const logItem = (item: ChainItem) => `.$('${item.type === 'template' ? item.selector(item.argument) : item.selector}')`;
    const logged = new Set<string>();
    // Polling validations re-invoke the getter on every attempt - log a resolved chain once,
    // so a single step does not end up with a stdout record per retry.
    const log = (logChain: string) => {
        const message = `${path} -> ${logChain.replace(/^\./, '')}`;
        if (logged.has(message)) return;
        logged.add(message);
        this.log(message);
    };
    /** Resolves the chain; with `all` the last item is resolved as a collection. */
    const resolve = (all: boolean): any => {
        // read at resolution time: the selected frame/tab may change after the locator is created
        const driver = this.driver as WebdriverIO.Browser;
        let current: any = this.target ?? driver;
        for (let i = 0; i < chain.length; i++) {
            current = resolveItem(chain[i], current, driver, all && i === chain.length - 1);
        }
        log(chain.map(logItem).join(''));
        return current;
    };
    const getter = (() => resolve(false)) as Locator;
    getter.collection = () => resolve(true);
    return getter;
}

function resolveItem(item: ChainItem, parent: any, driver: WebdriverIO.Browser, all: boolean): any {
    switch (item.type) {
        case 'simple':
            if (all) return parent.$$(item.selector);
            return item.selector ? parent.$(item.selector) : parent;
        case 'template': {
            const selector = item.selector(item.argument);
            return all ? parent.$$(selector) : parent.$(selector);
        }
        case 'native':
            return item.selector({ browser: driver, driver, parent, argument: item.argument });
        default:
            throw new Error(`Unknown selector type '${item.type}' of '${item.alias}'`);
    }
}