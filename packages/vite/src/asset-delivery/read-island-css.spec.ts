import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { islandCssReader } from './read-island-css.js';

describe('islandCssReader', () => {
  const dirs: string[] = [];

  afterEach(() => {
    for (const dir of dirs.splice(0)) {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it('returns css text and skips a missing or empty sidecar', () => {
    const dir = mkdtempSync(join(tmpdir(), 'island-css-'));
    dirs.push(dir);
    writeFileSync(join(dir, 'login-form.css'), '.root{color:red}');
    writeFileSync(join(dir, 'empty.css'), '');

    const read = islandCssReader(dir);

    expect(read('login-form')).toBe('.root{color:red}');
    expect(read('empty')).toBeUndefined();
    expect(read('missing')).toBeUndefined();
  });
});
