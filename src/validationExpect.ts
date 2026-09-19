import { expect as base, test } from '@qavajs/playwright-wdio-fixtures';
import { withoutSteps } from '@qavajs/playwright-wdio-fixtures/lib/steps';
import { sleep } from './utils';

export const expect = base.extend({
    toSimpleEqual(actual: any, expected: any) {
        const name = 'to equal';
        const pass = actual == expected;
        return {
            expected,
            actual,
            name,
            message: () => `expected ${this.utils.printExpected(actual)} ${pass ? 'not ': ''}to equal ${this.utils.printReceived(expected)}`,
            pass,
        };
    },
    toHaveType(actual: any, expected: string) {
        const pass = typeof actual == expected;
        return {
            message: () => `expected ${actual} ${pass ? 'not ': ''}to have type ${this.utils.printReceived(expected)}`,
            pass
        }
    },
    toSatisfy(actual: any, predicate: any) {
        const pass = predicate(actual);
        return {
            message: () => `expected ${actual} ${pass ? 'not ': ''}to satisfy ${this.utils.printReceived(predicate)}`,
            pass
        }
    }
});

export const validations = {
    EQUAL: 'equal',
    DEEPLY_EQUAL: 'deeply equal',
    STRICTLY_EQUAL: 'strictly equal',
    HAVE_MEMBERS: 'have member',
    MATCH: 'match',
    CONTAIN: 'contain',
    ABOVE: 'above',
    BELOW: 'below',
    GREATER: 'greater than',
    LESS: 'less than',
    HAVE_TYPE: 'have type',
    INCLUDE_MEMBERS: 'include member',
    MATCH_SCHEMA: 'match schema',
    SATISFY: 'satisfy',
    CASE_INSENSITIVE_EQUAL: 'case insensitive equal',
};

const isClause = '(?:is |do |does |to )?';
const notClause = '(?<reverse>not |to not )?';
const toBeClause = '(?:to )?(?:be )?';
const softClause = '(softly )?';
const validationClause = `(?:(?<validation>${Object.values(validations).join('|')})(?:s|es)?)`;

export const validationExtractRegexp = new RegExp(`^${isClause}${notClause}${toBeClause}${softClause}${validationClause}$`);

type ExpectOptions = {
    expected: any,
    actual?: any,
    reverse: boolean,
    soft?: boolean,
    message?: string
};

function expectValue({ expected, reverse, soft, message }: ExpectOptions) {
    const expectClause = expect.configure({ soft })(expected, message);
    return reverse ? expectClause.not : expectClause;
}

function toNumber(n: any): number {
    const parsedNumber = parseFloat(n);
    if (Number.isNaN(parsedNumber)) {
        throw new Error(`${n} is not a number`);
    }
    return parsedNumber
}

function toRegexp(r: string | RegExp): RegExp {
    return r instanceof RegExp ? r : new RegExp(r)
}

/** Mirrors the type check `toMatch` runs, so a value it would reject keeps the validation polling. */
function ensureString(value: any): string {
    if (typeof value !== 'string') throw new Error(`received value must be a string, got ${typeof value}`);
    return value;
}

/** Mirrors the type check `toBeGreaterThan`/`toBeLessThan` run, for the same reason. */
function ensureNumber(value: any): number {
    if (typeof value !== 'number' && typeof value !== 'bigint') {
        throw new Error(`received value must be a number or bigint, got ${typeof value}`);
    }
    return value as number;
}

/** Returns the keys of `value` that are not explicitly `undefined`, the way `toEqual` compares. */
function definedKeys(value: any): string[] {
    return Object.keys(value).filter(key => value[key] !== undefined);
}

/**
 * `toEqual`-style structural comparison used to decide when polling stops.
 * Recurses into arrays and plain objects, ignores properties explicitly set to `undefined`,
 * and defers to asymmetric matchers such as `expect.stringContaining('x')`.
 */
function deepEquals(actual: any, expected: any): boolean {
    if (typeof expected?.asymmetricMatch === 'function') return expected.asymmetricMatch(actual);
    if (Object.is(actual, expected)) return true;
    if (expected instanceof Date) return actual instanceof Date && actual.getTime() === expected.getTime();
    if (expected instanceof RegExp) return actual instanceof RegExp && String(actual) === String(expected);
    if (Array.isArray(expected)) {
        return Array.isArray(actual)
            && actual.length === expected.length
            && expected.every((item, index) => deepEquals(actual[index], item));
    }
    if (typeof expected !== 'object' || typeof actual !== 'object' || expected === null || actual === null) return false;
    const expectedKeys = definedKeys(expected);
    return expectedKeys.length === definedKeys(actual).length
        && expectedKeys.every(key => deepEquals(actual[key], expected[key]));
}

type Validator = {
    /**
     * Runs the real matcher. This is the single trace record a validation contributes,
     * and the only thing that decides pass or fail.
     */
    assert: (options: ExpectOptions) => any;
    /**
     * Decides when polling stops, without touching `expect` - calling the matcher per attempt is
     * what buries a waiting validation under a dozen near-identical trace records.
     * It only controls how long we wait: the verdict always comes from `assert` afterwards,
     * so a predicate that disagrees with its matcher can make the wait end early or late, never
     * report the wrong result.
     *
     * A predicate must throw wherever its matcher would refuse the value outright - `toMatch` on a
     * `null` attribute, say. A throw means 'not ready yet' whatever the polarity of the validation,
     * which is how `expect.poll` behaved: an attribute that starts out absent has to keep polling
     * even for 'not to match', instead of settling on a value the matcher cannot compare.
     */
    pass: (actual: any, expectation: any) => boolean;
    /** Applied to the expectation once, before polling starts, so a bad expectation throws up front. */
    expectation?: (expectation: any) => any;
};

const above: Validator = {
    assert: ({ expected, actual, reverse, soft, message }) =>
        expectValue({ expected, reverse, soft, message }).toBeGreaterThan(toNumber(actual)),
    pass: (actual, expectation) => ensureNumber(actual) > expectation,
    expectation: toNumber
};

const below: Validator = {
    assert: ({ expected, actual, reverse, soft, message }) =>
        expectValue({ expected, reverse, soft, message }).toBeLessThan(toNumber(actual)),
    pass: (actual, expectation) => ensureNumber(actual) < expectation,
    expectation: toNumber
};

const strictlyEqual: Validator = {
    assert: ({ expected, actual, reverse, soft, message }) =>
        expectValue({ expected, reverse, soft, message }).toEqual(actual),
    pass: deepEquals
};

const validators: Record<string, Validator> = {
    [validations.EQUAL]: {
        assert: ({ expected, actual, reverse, soft, message }) =>
            // @ts-ignore
            expectValue({ expected, reverse, soft, message: message ?? 'expect.toEqual' }).toSimpleEqual(actual),
        pass: (actual, expectation) => actual == expectation
    },
    [validations.STRICTLY_EQUAL]: strictlyEqual,
    [validations.DEEPLY_EQUAL]: strictlyEqual,
    [validations.MATCH]: {
        assert: ({ expected, actual, reverse, soft, message }) =>
            expectValue({ expected, reverse, soft, message }).toMatch(toRegexp(actual)),
        pass: (actual, expectation) => expectation.test(ensureString(actual)),
        expectation: toRegexp
    },
    [validations.CONTAIN]: {
        assert: ({ expected, actual, reverse, soft, message }) =>
            expectValue({ expected, reverse, soft, message }).toContain(actual),
        pass: (actual, expectation) => actual.includes(expectation)
    },
    [validations.ABOVE]: above,
    [validations.BELOW]: below,
    [validations.GREATER]: above,
    [validations.LESS]: below,
    [validations.HAVE_TYPE]: {
        assert: ({ expected, actual, reverse, soft, message }) =>
            // @ts-ignore
            expectValue({ expected, reverse, soft, message }).toHaveType(actual),
        pass: (actual, expectation) => typeof actual == expectation
    },
    [validations.CASE_INSENSITIVE_EQUAL]: {
        assert: ({ expected, actual, reverse, soft, message }) =>
            expectValue({ expected: expected.toLowerCase(), reverse, soft, message }).toEqual(actual.toLowerCase()),
        pass: (actual, expectation) => actual.toLowerCase() === expectation,
        expectation: (expectation: string) => expectation.toLowerCase()
    },
    [validations.SATISFY]: {
        assert: ({ expected, actual, reverse, soft, message }) =>
            // @ts-ignore
            expectValue({ expected, reverse, soft, message }).toSatisfy(actual),
        pass: (actual, expectation) => Boolean(expectation(actual))
    },
};

/** Playwright's own `defaultExpectTimeout`, used when the project does not configure one. */
const DEFAULT_EXPECT_TIMEOUT = 5000;
/** Retry delays `expect.poll` uses, kept so waiting validations behave as before. */
const DEFAULT_INTERVALS = [100, 250, 500, 1000];

/**
 * The expect timeout the project is configured with.
 *
 * Playwright resolves it onto the internal project record and only exposes it to matchers as
 * `this.timeout`, which is out of reach here - reading it via a probe matcher would cost the trace
 * record this whole path exists to save. Every lookup is optional, so an upstream rename degrades to
 * Playwright's own default rather than throwing, and callers can always pass a timeout explicitly.
 */
function expectTimeout(): number {
    try {
        const info = test.info() as any;
        return info.project?.expect?.timeout
            ?? info._projectInternal?.expect?.timeout
            ?? DEFAULT_EXPECT_TIMEOUT;
    } catch {
        return DEFAULT_EXPECT_TIMEOUT;
    }
}

/**
 * Re-reads `getter` until `pass` accepts its value or `timeout` runs out, then hands the last value
 * back to be asserted once.
 *
 * The loop runs inside `withoutSteps`, so the WebdriverIO commands it issues on every retry stay out
 * of the trace - a validation that waits a second used to leave a command step, an expect step and a
 * stdout line per attempt behind it. An exception from `getter` is final and is not retried, the way
 * `expect.poll` treated it.
 */
async function poll(getter: () => any, pass: (value: any) => boolean, timeout: number) {
    const deadline = Date.now() + timeout;
    return withoutSteps(async () => {
        for (let attempt = 0; ; attempt++) {
            const value = await getter();
            if (pass(value)) return { value, timedOut: false };
            if (Date.now() >= deadline) return { value, timedOut: true };
            await sleep(DEFAULT_INTERVALS[Math.min(attempt, DEFAULT_INTERVALS.length - 1)]);
        }
    });
}

function parseCondition(condition: string) {
    const match = condition.match(validationExtractRegexp) as RegExpMatchArray;
    if (!match) throw new Error(`${condition} expect is not implemented`);
    const [_, reverse, soft, validation] = match;
    const validator = validators[validation];
    if (!validator) throw new Error(`${condition} expect is not implemented`);
    return { validator, reverse: Boolean(reverse), soft: Boolean(soft) };
}

async function pollExpect(getter: () => any, expectation: any, condition: string, timeout: number) {
    const { validator, reverse, soft } = parseCondition(condition);
    const prepared = validator.expectation ? validator.expectation(expectation) : expectation;
    const pass = (value: any) => {
        try {
            return validator.pass(value, prepared) !== reverse;
        } catch {
            return false;
        }
    };
    const { value, timedOut } = await poll(getter, pass, timeout);
    const message = timedOut ? `Timed out ${timeout}ms waiting for value ${condition}` : undefined;
    return validator.assert({ expected: value, actual: expectation, reverse, soft, message });
}

export function valueExpect(
    expected: any,
    actual: any,
    condition: string,
    options: {
        poll: boolean,
        timeout?: number
    } = {
        poll: false
    }
) {
    if (options.poll) {
        return pollExpect(expected, actual, condition, options.timeout ?? expectTimeout());
    }
    const { validator, reverse, soft } = parseCondition(condition);
    return validator.assert({ expected, actual, reverse, soft });
}
