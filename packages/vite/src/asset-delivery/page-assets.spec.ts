import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import type { ClientManifest } from './asset-tags.js';
import {
  createPageAssets,
  extractCssFromViteModule,
  loadShellCssText,
  shellStyleTags,
} from './page-assets.js';
import { setPageStylesheetRegistry } from './page-stylesheets.js';

describe('extractCssFromViteModule', () => {
  it('parses a Vite CSS-module __vite__css string', () => {
    const code = `const __vite__css = "._a{color:red}";\nexport default {};`;
    expect(extractCssFromViteModule(code)).toBe('._a{color:red}');
  });

  it('returns plain CSS unchanged', () => {
    expect(extractCssFromViteModule('body{margin:0}')).toBe('body{margin:0}');
  });

  it('returns empty when the transform is JS without embedded CSS', () => {
    expect(extractCssFromViteModule('export default { count: "._a" };')).toBe(
      '',
    );
  });
});

describe('shellStyleTags', () => {
  const manifest: ClientManifest = {
    'src/web/ui/styles/shell.scss': { file: 'assets/shell.css', isEntry: true },
  };

  it('inlines when under budget', () => {
    expect(shellStyleTags(manifest, '.x{}', 100)).toEqual({
      stylesheets: [],
      inlineStyles: [{ id: 'shell', css: '.x{}' }],
    });
  });

  it('links when over budget', () => {
    const css = 'y'.repeat(20);
    expect(shellStyleTags(manifest, css, 10)).toEqual({
      stylesheets: ['/assets/shell.css'],
      inlineStyles: [],
    });
  });
});

describe('loadShellCssText', () => {
  it('reads the shell file from dist/client', () => {
    const dir = join(process.cwd(), 'dist/client/assets');
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, 'shell-load.css'), 'body{color:red}');

    const manifest: ClientManifest = {
      'src/web/ui/styles/shell.scss': {
        file: 'assets/shell-load.css',
        isEntry: true,
      },
    };

    expect(loadShellCssText(manifest)).toBe('body{color:red}');
  });
});

describe('createPageAssets', () => {
  it('inlines a small production shell and emits hydrate scripts for islands', () => {
    const dir = join(process.cwd(), 'dist/client/assets');
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, 'shell-small.css'), '.ok{}');

    const manifest: ClientManifest = {
      'src/web/ui/runtime/island/hydrate-entry.tsx': {
        file: 'assets/hydrate.js',
        isEntry: true,
      },
      'src/web/ui/styles/shell.scss': {
        file: 'assets/shell-small.css',
        isEntry: true,
      },
    };

    const idle = createPageAssets([], {
      development: false,
      manifest,
    });
    expect(idle.tags.inlineStyles).toEqual([{ id: 'shell', css: '.ok{}' }]);
    expect(idle.tags.stylesheets).toEqual([]);
    expect(idle.tags.scripts).toEqual([]);

    const active = createPageAssets(['mobile-navigation'], {
      development: false,
      manifest,
    });
    expect(active.tags.inlineStyles).toEqual([{ id: 'shell', css: '.ok{}' }]);
    expect(active.tags.scripts).toContain('/assets/hydrate.js');
  });

  it('links the forms sibling when the page opts in', () => {
    setPageStylesheetRegistry({
      forms: {
        source: 'src/web/ui/styles/forms.scss',
        devUrl: '/src/web/ui/styles/forms.scss',
      },
    });

    const dir = join(process.cwd(), 'dist/client/assets');
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, 'shell-forms-opt.css'), '.ok{}');

    const manifest: ClientManifest = {
      'src/web/ui/styles/shell.scss': {
        file: 'assets/shell-forms-opt.css',
        isEntry: true,
      },
      'src/web/ui/styles/forms.scss': {
        file: 'assets/forms-opt.css',
        isEntry: true,
      },
    };

    const assets = createPageAssets([], {
      development: false,
      manifest,
      pageStylesheets: ['forms'],
    });

    expect(assets.tags.inlineStyles).toEqual([{ id: 'shell', css: '.ok{}' }]);
    expect(assets.tags.stylesheets).toEqual(['/assets/forms-opt.css']);
    setPageStylesheetRegistry({});
  });
});
