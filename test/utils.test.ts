import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { equalOrIncludes, getEventValue, Keys, parseCoords, parseCoordsAsObject, parseKeySequence, VirtualPointer } from '../src/utils';

describe('parseCoords', () => {
    it('parses comma separated numbers with optional spaces', () => {
        assert.deepEqual(parseCoords('10, 20'), [10, 20]);
        assert.deepEqual(parseCoords('1.5,-3'), [1.5, -3]);
    });

    it('parses to object', () => {
        assert.deepEqual(parseCoordsAsObject('1366, 768'), { x: 1366, y: 768 });
    });
});

describe('parseKeySequence', () => {
    it('maps a named key', () => {
        assert.deepEqual(parseKeySequence('Enter'), [Keys.Enter]);
    });

    it('splits a modifier chord', () => {
        assert.deepEqual(parseKeySequence('Control+c'), [Keys.Control, 'c']);
        assert.deepEqual(parseKeySequence('Ctrl+Shift+a'), [Keys.Ctrl, Keys.Shift, 'a']);
    });

    it('splits plain text into characters', () => {
        assert.deepEqual(parseKeySequence('abc'), ['a', 'b', 'c']);
    });

    it('passes an array through', () => {
        assert.deepEqual(parseKeySequence(['a', 'b']), ['a', 'b']);
    });
});

describe('equalOrIncludes', () => {
    it('compares strings and searches arrays', () => {
        assert.equal(equalOrIncludes('a', 'a'), true);
        assert.equal(equalOrIncludes('a', 'b'), false);
        assert.equal(equalOrIncludes(['a', 'b'], 'b'), true);
    });
});

describe('getEventValue', () => {
    it('unwraps event', () => {
        assert.equal(getEventValue({ event: 'x' }), 'x');
        assert.equal(getEventValue('y'), 'y');
    });
});

describe('VirtualPointer', () => {
    it('keeps state per instance', () => {
        const a = new VirtualPointer();
        const b = new VirtualPointer();
        a.move(5, 6);
        assert.deepEqual(a.pointer(), { origin: 'viewport', x: 5, y: 6 });
        assert.deepEqual(b.pointer(), { origin: 'viewport', x: 0, y: 0 });
        assert.equal(a.wheel().origin, undefined);
    });
});
