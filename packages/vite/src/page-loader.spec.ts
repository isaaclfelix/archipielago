import { getViteDevServer, setViteDevServer } from './page-loader.js';

describe('page loader', () => {
  afterEach(() => {
    setViteDevServer(undefined);
  });

  it('stores and clears the vite dev server', () => {
    const server = {
      transformRequest: vi.fn(),
    };

    setViteDevServer(server);

    expect(getViteDevServer()).toBe(server);

    setViteDevServer(undefined);

    expect(getViteDevServer()).toBeUndefined();
  });
});
