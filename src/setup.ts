import { setWorldConstructor } from '@qavajs/playwright-runner-adapter';
import { QavajsPlaywrightWdioWorld } from './QavajsPlaywrightWdioWorld';

setWorldConstructor(QavajsPlaywrightWdioWorld);