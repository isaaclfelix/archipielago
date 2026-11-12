import { WebController } from './web.controller.js';

/**
 * Minimal request stub with an optional session (CSRF + optional user).
 *
 * @param {{ csrfToken?: string; userId?: string | null }} [options] - Session fields.
 * @returns {{ session?: { id: string; userId: string | null; csrfToken: string; expiresAt: Date } }}
 *   Request stub.
 */
function reqWithSession(options?: {
  csrfToken?: string;
  userId?: string | null;
}): {
  session?: {
    id: string;
    userId: string | null;
    csrfToken: string;
    expiresAt: Date;
  };
} {
  const csrfToken = options?.csrfToken;
  return {
    session: csrfToken
      ? {
          id: 'session-id',
          userId: options?.userId ?? null,
          csrfToken,
          expiresAt: new Date(),
        }
      : undefined,
  };
}

describe('WebController', () => {
  it('returns home view locals with CSRF and auth flag', () => {
    const controller = new WebController();

    expect(
      controller.home(reqWithSession({ csrfToken: 'csrf-home' }) as never),
    ).toEqual({
      renderedAt: expect.any(String),
      isAuthenticated: false,
      csrfToken: 'csrf-home',
      pageStylesheets: [],
    });
  });

  it('passes isAuthenticated true on home when the session has a user', () => {
    const controller = new WebController();

    expect(
      controller.home(
        reqWithSession({ csrfToken: 'csrf-home', userId: 'user-1' }) as never,
      ),
    ).toMatchObject({
      isAuthenticated: true,
      csrfToken: 'csrf-home',
    });
  });

  it('returns login view locals with CSRF', () => {
    const controller = new WebController();
    const res = { redirect: vi.fn() };

    expect(
      controller.login(
        reqWithSession({ csrfToken: 'csrf-login' }) as never,
        res as never,
      ),
    ).toEqual({
      isAuthenticated: false,
      csrfToken: 'csrf-login',
      pageStylesheets: ['forms'],
    });
    expect(res.redirect).not.toHaveBeenCalled();
  });

  it('redirects authenticated users away from login', () => {
    const controller = new WebController();
    const res = { redirect: vi.fn() };

    const result = controller.login(
      reqWithSession({
        csrfToken: 'csrf-login',
        userId: 'user-1',
      }) as never,
      res as never,
    );

    expect(result).toBeUndefined();
    expect(res.redirect).toHaveBeenCalledWith('/');
  });

  it('returns register view locals with CSRF', () => {
    const controller = new WebController();
    const res = { redirect: vi.fn() };

    expect(
      controller.register(
        reqWithSession({ csrfToken: 'csrf-register' }) as never,
        res as never,
      ),
    ).toEqual({
      isAuthenticated: false,
      csrfToken: 'csrf-register',
      pageStylesheets: ['forms'],
    });
    expect(res.redirect).not.toHaveBeenCalled();
  });

  it('redirects authenticated users away from register', () => {
    const controller = new WebController();
    const res = { redirect: vi.fn() };

    const result = controller.register(
      reqWithSession({
        csrfToken: 'csrf-register',
        userId: 'user-1',
      }) as never,
      res as never,
    );

    expect(result).toBeUndefined();
    expect(res.redirect).toHaveBeenCalledWith('/');
  });
});
