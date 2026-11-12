import { INestApplication, StandardSchemaValidationPipe } from '@nestjs/common';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { Test, TestingModule } from '@nestjs/testing';
import { App } from 'supertest/types.js';
import { AppModule } from '../src/app.module.js';
import { configureWebViews } from '../src/web/configure-web-views.js';
import { truncateDatabase } from './e2e-truncate.js';

export type E2eAppOptions = {
  /**
   * When true, installs StandardSchemaValidationPipe (user/OpenAPI suites).
   */
  validationPipe?: boolean;
  /**
   * Optional hook after createNestApplication (e.g. setupOpenApi).
   *
   * @param {INestApplication<App>} app - The Nest test application.
   * @returns {void}
   */
  configure?: (app: INestApplication<App>) => void;
};

/**
 * Boots AppModule against the Testcontainers database for one e2e test.
 *
 * Truncates tables first so each test starts from an empty store. Configures
 * Handlebars the same way `main.ts` does; HTTP e2e never runs bootstrap.
 *
 * @param {E2eAppOptions} [options] - Pipe and configure hooks.
 * @returns {Promise<INestApplication<App>>} Initialized Nest application.
 */
export async function createE2eApp(
  options: E2eAppOptions = {},
): Promise<INestApplication<App>> {
  // Clear rows from the previous test before wiring a new Nest app.
  await truncateDatabase();

  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleFixture.createNestApplication<NestExpressApplication>();
  await configureWebViews(app);
  if (options.validationPipe) {
    app.useGlobalPipes(new StandardSchemaValidationPipe());
  }
  options.configure?.(app);
  await app.init();
  return app;
}
