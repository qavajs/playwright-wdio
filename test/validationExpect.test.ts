import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { validationExtractRegexp, valueExpect } from '../src/validationExpect';
import { conditionWaitExtractRegexp } from '../src/conditionExpect';

describe('validation regexp', () => {
    for (const condition of ['to equal', 'not to equal', 'does not contain', 'to be above', 'to softly match', 'is case insensitive equal', 'equals']) {
        it(`matches '${condition}'`, () => {
            assert.match(condition, validationExtractRegexp);
        });
    }

    it('captures reverse and validation', () => {
        const groups = 'to not be deeply equal'.match(validationExtractRegexp)?.groups;
        assert.equal(groups?.reverse, 'not ');
        assert.equal(groups?.validation, 'deeply equal');
    });
});

describe('condition regexp', () => {
    it('matches state conditions', () => {
        assert.match('to be visible', conditionWaitExtractRegexp);
        assert.match('not to be present', conditionWaitExtractRegexp);
        assert.match('to be softly in viewport', conditionWaitExtractRegexp);
        assert.doesNotMatch('to be shiny', conditionWaitExtractRegexp);
    });
});

describe('valueExpect', () => {
    it('passes and fails simple validations', () => {
        valueExpect('1', 1, 'to equal');
        valueExpect({ a: [1] }, { a: [1] }, 'to deeply equal');
        valueExpect('qavajs', 'vajs', 'to contain');
        valueExpect('qavajs', '^qa', 'to match');
        valueExpect(5, '4', 'to be above');
        valueExpect('ABC', 'abc', 'to case insensitive equal');
        valueExpect('x', 'string', 'to have type');
        valueExpect(2, (v: number) => v % 2 === 0, 'to satisfy');
        assert.throws(() => valueExpect('a', 'b', 'to equal'));
        assert.throws(() => valueExpect('a', 'a', 'not to equal'));
    });

    it('reports unknown validation', () => {
        assert.throws(() => valueExpect(1, 1, 'to have members'), /to have members expect is not implemented/);
    });

    it('polls until the value settles', async () => {
        let n = 0;
        await valueExpect(() => ++n, 3, 'to equal', { poll: true, timeout: 2000 });
        assert.equal(n, 3);
    });

    it('polls through values the matcher rejects', async () => {
        const values = [null, 'ready'];
        await valueExpect(() => values.shift() ?? 'ready', 'rea', 'to match', { poll: true, timeout: 2000 });
    });

    it('compares structurally while polling', async () => {
        await valueExpect(() => ({ a: 1, b: undefined }), { a: 1 }, 'to deeply equal', { poll: true, timeout: 500 });
    });

    it('reports timeout', async () => {
        await assert.rejects(
            valueExpect(() => 'a', 'b', 'to equal', { poll: true, timeout: 150 }),
            /Timed out 150ms waiting for value to equal/
        );
    });
});
