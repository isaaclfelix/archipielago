import { Controller, Get, Req, Res, Render } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import type { AppSession } from '../api/auth/session.js';
import { pageStylesheetsByPage } from './page-stylesheets.js';
import type { HomePageSsrProps } from './protocol/page-props/home-page.ssr-props.js';
import type { LoginPageSsrProps } from './protocol/page-props/login-page.ssr-props.js';
import type { RegisterPageSsrProps } from './protocol/page-props/register-page.ssr-props.js';
import type { WebViewLocals } from './protocol/page-props/page-props.js';

/** Express request after SessionMiddleware may have attached a session. */
type RequestWithSession = Request & { session?: AppSession };

@Controller()
@ApiExcludeController()
export class WebController {
  /**
   * Renders the home page as HTML.
   *
   * Returns Handlebars locals. The layout prints chrome and asset tags; the
   * view prints the timestamp. Controllers stay free of React.
   *
   * @param {RequestWithSession} req - Request with session from SessionMiddleware.
   * @returns {WebViewLocals<'home'>} Locals for `views/home.hbs`.
   */
  @Get()
  @Render('home')
  home(@Req() req: RequestWithSession): WebViewLocals<'home'> {
    const props: HomePageSsrProps = {
      renderedAt: new Date().toISOString(),
      isAuthenticated: Boolean(req.session?.userId),
    };

    return {
      ...props,
      csrfToken: req.session?.csrfToken,
      pageStylesheets: pageStylesheetsByPage.home,
    };
  }

  /**
   * Renders the login page as HTML, or redirects authenticated users home.
   *
   * Form interactivity hydrates via the login-form island. Form CSS comes from
   * the opt-in forms sibling stylesheet for this page.
   *
   * @param {RequestWithSession} req - Request with session from SessionMiddleware.
   * @param {Response} res - Response used for guest-only redirects.
   * @returns {WebViewLocals<'login'> | void} Locals for `views/login.hbs`, or void after redirect.
   */
  @Get('login')
  @Render('login')
  login(
    @Req() req: RequestWithSession,
    @Res({ passthrough: true }) res: Response,
  ): WebViewLocals<'login'> | void {
    if (req.session?.userId) {
      res.redirect('/');
      return;
    }

    const props: LoginPageSsrProps = {
      isAuthenticated: false,
    };

    return {
      ...props,
      csrfToken: req.session?.csrfToken,
      pageStylesheets: pageStylesheetsByPage.login,
    };
  }

  /**
   * Renders the register page as HTML, or redirects authenticated users home.
   *
   * Form interactivity hydrates via the register-form island. Form CSS comes
   * from the opt-in forms sibling stylesheet for this page.
   *
   * @param {RequestWithSession} req - Request with session from SessionMiddleware.
   * @param {Response} res - Response used for guest-only redirects.
   * @returns {WebViewLocals<'register'> | void} Locals for `views/register.hbs`, or void after redirect.
   */
  @Get('register')
  @Render('register')
  register(
    @Req() req: RequestWithSession,
    @Res({ passthrough: true }) res: Response,
  ): WebViewLocals<'register'> | void {
    if (req.session?.userId) {
      res.redirect('/');
      return;
    }

    const props: RegisterPageSsrProps = {
      isAuthenticated: false,
    };

    return {
      ...props,
      csrfToken: req.session?.csrfToken,
      pageStylesheets: pageStylesheetsByPage.register,
    };
  }
}
