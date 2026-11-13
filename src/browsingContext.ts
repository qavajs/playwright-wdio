import type { ChainablePromiseElement } from 'webdriverio';
import type { QavajsPlaywrightWdioWorld } from './QavajsPlaywrightWdioWorld';

/*
 * Frame and window switching for both kinds of sessions.
 *
 * WebdriverIO v10 removed `switchFrame`/`switchWindow` for WebDriver BiDi sessions: a frame or tab is
 * a `BrowsingContext` that has to be held and used directly. In a BiDi session the switch steps keep the
 * selected context on the World (`world.browsingContext`), and steps run their commands on `world.target`
 * (or `world.tab` for url, title and navigation). Window switches also call `switchToWindow`, so the
 * session's own current window follows and plain `driver` calls keep working.
 * Classic sessions keep using the session-level commands and never hold a context.
 */

async function windowContext(world: QavajsPlaywrightWdioWorld, handle: string): Promise<WebdriverIO.BrowsingContext> {
    const contexts = await world.driver.browsingContexts();
    const context = contexts.find(context => context.contextId === handle);
    if (!context) throw new Error(`Browsing context of window '${handle}' is not found`);
    return context;
}

/** Make the window with this handle the current one */
export async function switchToWindow(world: QavajsPlaywrightWdioWorld, handle: string) {
    await world.driver.switchToWindow(handle);
    world.browsingContext = world.driver.isBidi ? await windowContext(world, handle) : undefined;
}

/**
 * Find a window by handle, url, title or `window.name` (substring match), the way `switchWindow` does.
 * Leaves the session on the original window when nothing matches.
 */
export async function findWindow(world: QavajsPlaywrightWdioWorld, matcher: string): Promise<string | undefined> {
    const driver = world.driver;
    const handles = await driver.getWindowHandles();
    if (handles.includes(matcher)) return matcher;
    const current = await driver.getWindowHandle();
    for (const handle of handles) {
        await driver.switchToWindow(handle);
        if ((await driver.getUrl()).includes(matcher)) return handle;
        if ((await driver.getTitle()).includes(matcher)) return handle;
        const name = await driver.execute(() => window.name);
        if (name?.includes(matcher)) return handle;
    }
    await driver.switchToWindow(current);
}

/** Enter a frame of the current frame/tab */
export async function switchToFrame(world: QavajsPlaywrightWdioWorld, frame: ChainablePromiseElement) {
    if (!world.driver.isBidi) return world.driver.switchFrame(frame);
    const host = world.browsingContext ?? await windowContext(world, await world.driver.getWindowHandle());
    world.browsingContext = await host.frame(frame);
}

/** Leave all frames for the top-level document of the current tab */
export async function switchToTopFrame(world: QavajsPlaywrightWdioWorld) {
    if (!world.driver.isBidi) return world.driver.switchFrame(null);
    resetToTab(world);
}

/** Navigation replaces the document, so a selected frame is gone: keep only its tab selected */
export function resetToTab(world: QavajsPlaywrightWdioWorld) {
    if (world.browsingContext) world.browsingContext = world.tab as WebdriverIO.BrowsingContext;
}
