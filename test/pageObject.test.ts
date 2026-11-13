import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { element, locator, query } from '../src/pageObject';

class Item {
    Title = locator('.title');
}

class App {
    Button = locator('#button');
    List = locator('ul > li');
    ItemByIndex = locator.template((index: string) => `li:nth-child(${index})`);
    Card = locator('.card').as(Item);
    Wrapper = locator.as(Item);
}

describe('query', () => {
    it('resolves a simple alias, ignoring spaces', () => {
        const [item] = query(new App(), 'Butt on');
        assert.equal(item.alias, 'Button');
        assert.equal(item.selector, '#button');
        assert.equal(item.type, 'simple');
    });

    it('resolves a class root', () => {
        assert.equal(query(App, 'Button')[0].selector, '#button');
    });

    it('resolves template argument', () => {
        const [item] = query(new App(), 'Item By Index (3)');
        assert.equal(item.type, 'template');
        assert.equal(item.argument, '3');
        assert.equal(item.selector(item.argument), 'li:nth-child(3)');
    });

    it('walks into components', () => {
        const chain = query(new App(), 'Card > Title');
        assert.deepEqual(chain.map(i => i.selector), ['.card', '.title']);
        assert.deepEqual(query(new App(), 'Wrapper > Title').map(i => i.selector), [null, '.title']);
    });

    it('fails on unknown alias and on non-component', () => {
        assert.throws(() => query(new App(), 'Missing'), /Alias 'Missing' has not been found in 'App'/);
        assert.throws(() => query(new App(), 'Button > Title'), /Alias 'Button' is not a component/);
    });

    it('uses defaultResolver for unknown aliases', () => {
        const root = { defaultResolver: ({ alias }: { alias: string }) => alias };
        const [item] = query(root, 'Any Text');
        assert.equal(item.type, 'native');
        assert.equal(item.selector, 'Any Text');
    });
});

describe('element', () => {
    function fakeDriver() {
        const calls: string[] = [];
        const node = (path: string): any => ({
            path,
            $: (s: string) => { calls.push(`$(${s})`); return node(`${path} ${s}`); },
            $$: (s: string) => { calls.push(`$$(${s})`); return node(`${path} [${s}]`); }
        });
        return { driver: node('root'), calls };
    }

    it('resolves the chain and logs it once', () => {
        const { driver } = fakeDriver();
        const logs: string[] = [];
        const world = { pageObject: new App(), driver, log: (m: string) => logs.push(m) };
        const card = element.call(world, 'Card > Title');
        assert.equal((card() as any).path, 'root .card .title');
        card();
        assert.deepEqual(logs, [`Card > Title -> $('.card').$('.title')`]);
    });

    it('resolves the last item as a collection', () => {
        const { driver } = fakeDriver();
        const world = { pageObject: new App(), driver, log: () => {} };
        assert.equal((element.call(world, 'Card > Title').collection() as any).path, 'root .card [.title]');
    });

    it('passes context to native selectors', () => {
        const { driver } = fakeDriver();
        const root = { Native: locator.native(({ parent, argument }) => parent.$(`#${argument}`)) };
        const world = { pageObject: root, driver, log: () => {} };
        assert.equal((element.call(world, 'Native (id)')() as any).path, 'root #id');
    });
});
