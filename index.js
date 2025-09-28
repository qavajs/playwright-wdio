const adapter= require('@qavajs/playwright-runner-adapter');
const worlds = require('./lib/QavajsPlaywrightWdioWorld');
const { locator } = require('./lib/pageObject');

module.exports = {
    ...adapter,
    ...worlds,
    locator
}