import { defineConfig } from 'vitest/config';
import { browserUnitSpecGlobs } from './vitest.config.browser.js';
import { sharedVitestViteConfig } from './vitest.shared.js';

export default defineConfig({
  test: {
    // Run-level coverage applies across node + browser unit projects.
    coverage: {
      provider: 'v8',
      allowExternal: true,
      reportsDirectory: './coverage',
      reporter: ['text', 'html', 'lcov', 'json-summary', 'json'],
      // App source including product React views; Nest wiring stays excluded.
      include: [
        'src/**/*.ts',
        '../../packages/core/src/**/*.ts',
        '../../packages/react/src/**/*.ts',
        '../../packages/vite/src/**/*.ts',
        '../../packages/nestjs/src/**/*.ts',
        'src/web/ui/islands/**/*.tsx',
        'src/web/ui/shared-components/**/*.tsx',
        '../../packages/react/**/*.tsx',
      ],
      exclude: [
        'src/main.ts',
        // Nest process wiring; exercised by e2e boot, not unit specs.
        'src/logger.middleware.ts',
        'src/api/openapi.setup.ts',
        'src/api/auth/express-augmentation.ts',
        // Vite build-time plugins; not Nest runtime.
        '**/packages/vite/src/plugins/vite-shell-css-budget.ts',
        '**/packages/vite/src/plugins/vite-strip-island-css-preload.ts',
        '**/packages/vite/src/plugins/vite-suppress-island-css-inject.ts',
        '**/packages/vite/src/plugins/vite-write-island-css-sidecar.ts',
        'src/**/*.module.ts',
        'src/**/*.spec.ts',
        // Storybook workshop files; not unit-tested runtime.
        'src/**/*.stories.ts',
        'src/**/*.stories.tsx',
        // Runtime plumbing; covered indirectly by HTTP and browser e2e.
        'src/web/configure-web-views.ts',
        '**/packages/react/src/runtime/island/hydrate.tsx',
        'src/web/ui/runtime/island/hydrate-entry.tsx',
        // One-line window.location.assign wrapper; exercised via browser e2e.
        'src/web/ui/api-fetch/assign-location.ts',
        // Type-only modules: V8 coverage remap cannot parse `import type` alone.
        '**/packages/core/src/page-assets.ts',
        '**/packages/react/src/runtime/island/island-module.ts',
        'src/generated/**',
        '**/node_modules/**',
        '**/dist/**',
      ],
      // Floors locked under measured monorepo baseline after Nest example move
      // (branches sit just under the old 96% floor). Raise when coverage improves.
      thresholds: {
        statements: 98,
        branches: 95,
        functions: 98,
        lines: 98,
      },
    },
    projects: [
      {
        ...sharedVitestViteConfig(),
        test: {
          name: 'node',
          globals: true,
          root: './',
          setupFiles: ['./test/vitest-register-islands.ts'],
          include: [
            'src/**/*.spec.ts',
            '../../packages/{core,react,vite,nestjs}/src/**/*.spec.ts',
            'scripts/**/*.spec.ts',
          ],
          exclude: [
            '**/node_modules/**',
            '../../packages/**/node_modules/**',
            '**/dist/**',
            ...browserUnitSpecGlobs,
          ],
        },
      },
      './vitest.config.browser.ts',
    ],
  },
});
