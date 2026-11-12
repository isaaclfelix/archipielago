/**
 * Enough of a Vite dev server to remember for asset-tag development mode.
 *
 * The full ViteDevServer satisfies this. Tests can pass a stub.
 */
export interface ViteDevServerHandle {
  transformRequest?(
    url: string,
  ): Promise<{ code: string; map?: unknown } | null | undefined>;
}

let viteDevServer: ViteDevServerHandle | undefined;

/**
 * Remembers the dev server created during bootstrap.
 *
 * Call with `undefined` when the process is shutting down or a test needs a
 * clean loader. Production never sets this. Asset helpers treat a registered
 * server as development.
 *
 * @param {ViteDevServerHandle | undefined} server - Middleware-mode Vite server, or undefined to clear it.
 * @returns {void}
 */
export function setViteDevServer(
  server: ViteDevServerHandle | undefined,
): void {
  viteDevServer = server;
}

/**
 * Returns the dev server registered for this process.
 *
 * @returns {ViteDevServerHandle | undefined} The Vite server, when bootstrap registered one.
 */
export function getViteDevServer(): ViteDevServerHandle | undefined {
  return viteDevServer;
}
