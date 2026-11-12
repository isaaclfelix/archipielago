import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule, ObserveInstrument } from './app.module.js';
import { StandardSchemaValidationPipe } from '@nestjs/common';
import { setupOpenApi } from './api/openapi.setup.js';
import { mountArchipielagoAssets } from '@archipielago/nestjs/mount-assets.js';
import { configureWebViews } from './web/configure-web-views.js';

/**
 * Starts the Nest HTTP application.
 *
 * Registers Handlebars views and Drih includes, the global Standard Schema
 * validation pipe, Swagger UI at `/api/docs`, Archipielago client assets
 * (Vite middleware in development, static files in production), and listens on
 * PORT or 3000.
 *
 * @returns {Promise<void>} Resolves when the server is listening.
 */
async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    instrument: ObserveInstrument,
  });

  await configureWebViews(app);
  app.useGlobalPipes(new StandardSchemaValidationPipe());
  setupOpenApi(app);

  // Archipielago selects and mounts the production or development asset path.
  await mountArchipielagoAssets(app);

  await app.listen(process.env.PORT ?? 3000);
}
await bootstrap();
