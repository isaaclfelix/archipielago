import { defineConfig } from '@drih/dehydrate';

/**
 * Nested island entries under `src/web/ui/islands/<name>/<name>.tsx`.
 */
export default defineConfig({
  dehydrationSourceDir: 'src/web/ui/islands',
  dehydratedComponentsDir: 'views/components/dehydrated',
  dehydratedComponentFileExtension: '.html',
  dehydrationSourceFileExtension: '.tsx',
  componentLayout: 'nested',
});
