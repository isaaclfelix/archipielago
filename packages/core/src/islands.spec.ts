import { describe, expect, it } from 'vitest';
import {
  islandCssModulePath,
  islandEntryRelPath,
  islandManifestSourceKey,
} from './islands.js';

describe('Archipielago islands helpers', () => {
  it('builds concrete entry and CSS module paths', () => {
    expect(islandEntryRelPath('mobile-navigation')).toBe(
      'src/web/ui/islands/mobile-navigation/mobile-navigation.tsx',
    );
    expect(islandCssModulePath('mobile-navigation')).toBe(
      '/src/web/ui/islands/mobile-navigation/mobile-navigation.module.scss',
    );
    expect(islandManifestSourceKey('mobile-navigation')).toBe(
      islandEntryRelPath('mobile-navigation'),
    );
  });
});
