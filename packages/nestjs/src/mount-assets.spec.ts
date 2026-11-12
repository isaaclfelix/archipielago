import {
  clientAssetsRoot,
  createDevAssetPipeline,
} from '@archipielago/vite/asset-pipeline.js';
import { ArchipielagoModule } from './archipielago.module.js';
import {
  mountArchipielagoAssets,
  type ArchipielagoAssetHost,
} from './mount-assets.js';

vi.mock('@archipielago/vite/asset-pipeline.js', () => ({
  clientAssetsRoot: vi.fn(() => '/built/client'),
  createDevAssetPipeline: vi.fn(async () => ({
    middlewares: 'vite-middleware',
  })),
}));

describe('ArchipielagoModule', () => {
  it('is a Nest module with no renderer providers', () => {
    expect(ArchipielagoModule).toBeDefined();
  });
});

describe('mountArchipielagoAssets', () => {
  it('mounts the built client directory in production', async () => {
    const app = {
      use: vi.fn(),
      useStaticAssets: vi.fn().mockReturnThis(),
    } satisfies ArchipielagoAssetHost;

    await mountArchipielagoAssets(app, { production: true });

    expect(clientAssetsRoot).toHaveBeenCalledOnce();
    expect(app.useStaticAssets).toHaveBeenCalledWith('/built/client', {
      index: false,
    });
    expect(app.use).not.toHaveBeenCalled();
  });

  it('mounts Vite middleware in development', async () => {
    const app = {
      use: vi.fn(),
      useStaticAssets: vi.fn().mockReturnThis(),
    } satisfies ArchipielagoAssetHost;

    await mountArchipielagoAssets(app, { production: false });

    expect(createDevAssetPipeline).toHaveBeenCalledOnce();
    expect(app.use).toHaveBeenCalledWith('vite-middleware');
    expect(app.useStaticAssets).not.toHaveBeenCalled();
  });
});
