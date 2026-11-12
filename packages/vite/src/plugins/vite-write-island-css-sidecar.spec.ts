import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  deleteIslandCssSidecarFile,
  islandCssSidecarPath,
  islandNameFromIslandsPath,
  listIslandCssNames,
  writeIslandCssSidecarFile,
} from './vite-write-island-css-sidecar.js';

describe('listIslandCssNames', () => {
  it('lists nested islands that have a colocated scss module', () => {
    const root = mkdtempSync(join(tmpdir(), 'island-css-'));
    mkdirSync(join(root, 'mobile-navigation'), { recursive: true });
    mkdirSync(join(root, 'login-form'), { recursive: true });
    writeFileSync(
      join(root, 'mobile-navigation', 'mobile-navigation.module.scss'),
      '',
    );
    writeFileSync(join(root, 'login-form', 'login-form.tsx'), '');

    try {
      expect(listIslandCssNames(root)).toEqual(['mobile-navigation']);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it('returns an empty list when the islands folder is missing', () => {
    expect(listIslandCssNames(join(tmpdir(), 'missing-islands'))).toEqual([]);
  });
});

describe('writeIslandCssSidecarFile', () => {
  it('writes css and deletes an empty sidecar', () => {
    const outDir = mkdtempSync(join(tmpdir(), 'sidecar-'));

    try {
      writeIslandCssSidecarFile(outDir, 'mobile-navigation', '._a{color:red}');
      expect(
        readFileSync(islandCssSidecarPath(outDir, 'mobile-navigation'), 'utf8'),
      ).toBe('._a{color:red}');

      writeIslandCssSidecarFile(outDir, 'mobile-navigation', '');
      expect(() =>
        readFileSync(islandCssSidecarPath(outDir, 'mobile-navigation'), 'utf8'),
      ).toThrow();

      deleteIslandCssSidecarFile(outDir, 'login-form');
    } finally {
      rmSync(outDir, { recursive: true, force: true });
    }
  });
});

describe('islandNameFromIslandsPath', () => {
  it('accepts a nested entry and its css module', () => {
    const islandsDir = '/app/src/web/ui/islands';

    expect(
      islandNameFromIslandsPath(
        join(islandsDir, 'mobile-navigation', 'mobile-navigation.tsx'),
        islandsDir,
      ),
    ).toBe('mobile-navigation');
    expect(
      islandNameFromIslandsPath(
        join(islandsDir, 'mobile-navigation', 'mobile-navigation.module.scss'),
        islandsDir,
      ),
    ).toBe('mobile-navigation');
    expect(
      islandNameFromIslandsPath(
        join(islandsDir, 'mobile-navigation', 'mobile-navigation.stories.tsx'),
        islandsDir,
      ),
    ).toBeUndefined();
  });
});
