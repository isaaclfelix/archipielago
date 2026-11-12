import { mkdir, mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import {
  applyArchipielagoUserConfig,
  defaultArchipielagoResolvedConfig,
  getArchipielagoConfig,
  loadAndApplyArchipielagoConfig,
  resetArchipielagoConfig,
} from './config.js';
import { defaultArchipielagoPaths, setArchipielagoPaths } from './paths.js';

const tempDirs: string[] = [];

afterEach(async () => {
  resetArchipielagoConfig();
  const { rm } = await import('node:fs/promises');
  await Promise.all(
    tempDirs.splice(0).map((dir) => rm(dir, { recursive: true, force: true })),
  );
});

describe('Archipielago config', () => {
  it('defaults to sample paths', () => {
    expect(getArchipielagoConfig()).toEqual(
      defaultArchipielagoResolvedConfig(),
    );
  });

  it('resets when apply receives undefined', () => {
    setArchipielagoPaths({ clientOutDirRel: 'tmp/client' });
    applyArchipielagoUserConfig(undefined);
    expect(getArchipielagoConfig().paths).toEqual(defaultArchipielagoPaths);
  });

  it('loads archipielago.config.ts from a repo root', async () => {
    const root = await mkdtemp(join(tmpdir(), 'arch-config-'));
    tempDirs.push(root);
    await writeFile(
      join(root, 'archipielago.config.ts'),
      `export default {};
`,
    );

    const resolved = await loadAndApplyArchipielagoConfig(root);
    expect(resolved.paths).toEqual(defaultArchipielagoPaths);
  });

  it('resets when the config file is missing', async () => {
    setArchipielagoPaths({ clientOutDirRel: 'tmp/client' });
    const root = await mkdtemp(join(tmpdir(), 'arch-config-empty-'));
    tempDirs.push(root);
    await mkdir(root, { recursive: true });

    const resolved = await loadAndApplyArchipielagoConfig(root);
    expect(resolved.paths).toEqual(defaultArchipielagoPaths);
  });
});
