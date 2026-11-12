/**
 * Scaffolds a Handlebars page stub or interactive island.
 *
 * Shared by humans (`pnpm scaffold:web-ui`) and the `create-web-ui` agent skill.
 * Prefer this script over hand-wiring so island folders stay conventional.
 *
 * Usage:
 *   pnpm scaffold:web-ui --name my-widget --mode island --with-styles
 *   pnpm scaffold:web-ui --name about --mode page
 *   pnpm scaffold:web-ui   # interactive
 */
import { existsSync } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { createInterface } from 'node:readline/promises';
import { fileURLToPath } from 'node:url';
import { stdin as input, stdout as output } from 'node:process';
import { loadAndApplyArchipielagoConfig } from '@archipielago/core/config.js';

/** CLI / interactive answers before validation. */
export interface ScaffoldAnswers {
  name: string;
  mode: 'page' | 'island';
  withStyles: boolean;
}

/** Validated plan the writer applies (or tests assert). */
export interface ScaffoldPlan {
  name: string;
  mode: 'page' | 'island';
  withStyles: boolean;
  pascalName: string;
  pageViewPath: string;
  pagePropsPath: string;
  islandComponentPath: string;
  islandIndexPath: string;
  islandStoriesPath: string;
  islandModulePath: string | undefined;
  cssModulePath: string | undefined;
}

/** Files written plus author-facing notes. */
export interface ScaffoldResult {
  written: string[];
  notes: string[];
}

/**
 * Converts a kebab-case name to PascalCase for React components.
 *
 * @param {string} kebab - e.g. `my-widget`.
 * @returns {string} e.g. `MyWidget`.
 */
export function kebabToPascal(kebab: string): string {
  return kebab
    .split('-')
    .filter((part) => part.length > 0)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
}

/**
 * Validates answers and returns paths relative to the repo root.
 *
 * Rejects `--mode page --with-styles` (static pages must use the shell, not a module).
 * Rejects non-kebab names.
 *
 * @param {ScaffoldAnswers} answers - Raw CLI or prompt answers.
 * @returns {ScaffoldPlan} Paths and names ready to write.
 * @throws {Error} When validation fails.
 */
export function resolveScaffoldPlan(answers: ScaffoldAnswers): ScaffoldPlan {
  const name = answers.name.trim();
  if (!/^[a-z][a-z0-9]*(-[a-z0-9]+)*$/.test(name)) {
    throw new Error(
      `Invalid --name "${answers.name}". Use kebab-case (e.g. my-widget).`,
    );
  }

  if (answers.mode !== 'page' && answers.mode !== 'island') {
    throw new Error(
      `Invalid --mode "${String(answers.mode)}". Use page or island.`,
    );
  }

  if (answers.mode === 'page' && answers.withStyles) {
    throw new Error(
      'Cannot use --with-styles with --mode page. Static pages use shell classes only (see docs/how-to-web-ui.md).',
    );
  }

  const pascalName = kebabToPascal(name);
  const withStyles = answers.mode === 'island' && answers.withStyles;
  const pageFolder = `${name}-page`;

  return {
    name,
    mode: answers.mode,
    withStyles,
    pascalName,
    pageViewPath: `views/${name}.hbs`,
    pagePropsPath: `src/web/protocol/page-props/${pageFolder}.locals.ts`,
    islandComponentPath: `src/web/ui/islands/${name}/${name}.tsx`,
    islandIndexPath: `src/web/ui/islands/${name}/index.ts`,
    islandStoriesPath: `src/web/ui/islands/${name}/${name}.stories.tsx`,
    islandModulePath: withStyles
      ? `src/web/ui/islands/${name}/${name}.module.scss`
      : undefined,
    cssModulePath: withStyles
      ? `/src/web/ui/islands/${name}/${name}.module.scss`
      : undefined,
  };
}

/**
 * Parses argv flags for non-interactive scaffolding.
 *
 * @param {string[]} argv - Process args after the script name.
 * @returns {Partial<ScaffoldAnswers> & { help?: boolean }} Parsed flags.
 */
export function parseScaffoldArgs(
  argv: string[],
): Partial<ScaffoldAnswers> & { help?: boolean } {
  const result: Partial<ScaffoldAnswers> & { help?: boolean } = {};

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--help' || arg === '-h') {
      result.help = true;
      continue;
    }
    if (arg === '--with-styles') {
      result.withStyles = true;
      continue;
    }
    if (arg === '--name') {
      result.name = argv[i + 1];
      i += 1;
      continue;
    }
    if (arg === '--mode') {
      const mode = argv[i + 1];
      if (mode === 'page' || mode === 'island') {
        result.mode = mode;
      } else {
        throw new Error(`Invalid --mode "${mode ?? ''}". Use page or island.`);
      }
      i += 1;
      continue;
    }
    throw new Error(`Unknown argument: ${arg}`);
  }

  return result;
}

/**
 * Builds page stub source (shell classes only; no CSS module).
 *
 * @param {ScaffoldPlan} plan - Validated plan.
 * @returns {{ props: string; view: string }} File contents.
 */
function pageSources(plan: ScaffoldPlan): { props: string; view: string } {
  const propsName = `${plan.pascalName}PageLocals`;

  const props = `/**
 * View locals for the ${plan.name} page (\`views/${plan.name}.hbs\`).
 *
 * Built by Nest (\`WebController\`) and passed to Handlebars. JSON-serializable
 * only. Not colocated with the view on purpose — see ADR-0023 / how-to-web-ui.
 */
export interface ${propsName} {
  /** Replace with real request-derived fields. */
  title: string;
}
`;

  const view = `<div class="container py-4">
  <h1>{{title}}</h1>
</div>
`;

  return { props, view };
}

/**
 * Builds a minimal CSF3 Storybook stub for a scaffolded island.
 *
 * @param {ScaffoldPlan} plan - Validated plan.
 * @returns {string} Story file contents.
 */
function islandStoriesSource(plan: ScaffoldPlan): string {
  return `import type { Meta, StoryObj } from '@storybook/react-vite';
import ${plan.pascalName} from './${plan.name}';

const meta = {
  title: 'Islands/${plan.pascalName}',
  component: ${plan.pascalName},
} satisfies Meta<typeof ${plan.pascalName}>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
`;
}

/**
 * Builds island component (and optional module) source.
 *
 * @param {ScaffoldPlan} plan - Validated plan.
 * @returns {{ component: string; moduleCss: string | undefined }} File contents.
 */
function islandSources(plan: ScaffoldPlan): {
  component: string;
  moduleCss: string | undefined;
} {
  const importStyles = plan.withStyles
    ? `import styles from './${plan.name}.module.scss';\n`
    : '';
  const className = plan.withStyles
    ? ` className={styles.root}`
    : ' className="btn btn-primary"';

  const component = `'use client';

import { useState, type ReactElement } from 'react';
${importStyles}
/**
 * Interactive ${plan.name} island.
 *
 * Default export required for hydrate. Props must be JSON-serializable.
 * Include with \`{{{hydrate "${plan.name}"}}}\` from a Handlebars view, then
 * run \`pnpm dehydrate\` so the HTML sidecar exists.
 *
 * @param {{ label?: string }} props - Optional label from the server.
 * @returns {ReactElement} Interactive island markup.
 */
export default function ${plan.pascalName}({
  label = '${plan.pascalName}',
}: {
  label?: string;
}): ReactElement {
  const [ready, setReady] = useState(false);

  return (
    <button
      type="button"${className}
      onClick={() => setReady((value) => !value)}
    >
      {ready ? \`\${label} ready\` : label}
    </button>
  );
}
`;

  const moduleCss = plan.withStyles
    ? `// Island-owned interaction styles. Keep small — not a second design system.
// Use tokens for Sass API only; never re-import the shell sheet.

@import '@ui/styles/tokens';

.root {
  // Interaction-specific rules (hover, open state, spinner, …).
  &:hover {
    opacity: 0.9;
  }
}
`
    : undefined;

  return { component, moduleCss };
}

/**
 * Writes scaffold files under `rootDir`.
 *
 * Callers that care about host path defaults should run
 * {@link loadAndApplyArchipielagoConfig} first (CLI does).
 *
 * @param {string} rootDir - Repository root.
 * @param {ScaffoldPlan} plan - Validated plan.
 * @returns {Promise<ScaffoldResult>} Paths written and author notes.
 */
export async function applyScaffoldPlan(
  rootDir: string,
  plan: ScaffoldPlan,
): Promise<ScaffoldResult> {
  const written: string[] = [];
  const notes: string[] = [];

  if (plan.mode === 'page') {
    const { props, view } = pageSources(plan);
    const propsAbs = join(rootDir, plan.pagePropsPath);
    const viewAbs = join(rootDir, plan.pageViewPath);

    if (existsSync(propsAbs) || existsSync(viewAbs)) {
      throw new Error(
        `Page files already exist for "${plan.name}" (protocol page-props or views)`,
      );
    }

    await mkdir(dirname(propsAbs), { recursive: true });
    await mkdir(dirname(viewAbs), { recursive: true });
    await writeFile(propsAbs, props, 'utf8');
    await writeFile(viewAbs, view, 'utf8');
    written.push(propsAbs, viewAbs);
    return { written, notes };
  }

  const { component, moduleCss } = islandSources(plan);
  const componentAbs = join(rootDir, plan.islandComponentPath);
  const indexAbs = join(rootDir, plan.islandIndexPath);
  const storiesAbs = join(rootDir, plan.islandStoriesPath);
  if (existsSync(componentAbs)) {
    throw new Error(`Island file already exists: ${plan.islandComponentPath}`);
  }
  if (plan.islandModulePath) {
    const moduleAbs = join(rootDir, plan.islandModulePath);
    if (existsSync(moduleAbs)) {
      throw new Error(`CSS module already exists: ${plan.islandModulePath}`);
    }
  }

  const islandIndex = `export { default } from './${plan.name}';\n`;

  await mkdir(dirname(componentAbs), { recursive: true });
  await writeFile(componentAbs, component, 'utf8');
  await writeFile(indexAbs, islandIndex, 'utf8');
  await writeFile(storiesAbs, islandStoriesSource(plan), 'utf8');
  written.push(componentAbs, indexAbs, storiesAbs);

  if (moduleCss && plan.islandModulePath) {
    const moduleAbs = join(rootDir, plan.islandModulePath);
    await writeFile(moduleAbs, moduleCss, 'utf8');
    written.push(moduleAbs);
  }

  notes.push(
    `Include with {{{hydrate "${plan.name}"}}} in a Handlebars view, then run pnpm dehydrate.`,
  );

  return { written, notes };
}

/**
 * Prints usage for `--help` or incomplete interactive sessions.
 *
 * @returns {void}
 */
function printHelp(): void {
  output.write(`Usage:
  pnpm scaffold:web-ui --name <kebab> --mode page|island [--with-styles]
  pnpm scaffold:web-ui   # interactive

--with-styles is allowed only with --mode island (adds *.module.scss).
Island mode does not write a protocol manifest. Include the island from a
Handlebars view and run pnpm dehydrate.
See docs/how-to-web-ui.md for the decision tree.
`);
}

/**
 * Prompts for name, mode, and optional styles when flags are incomplete.
 *
 * @param {Partial<ScaffoldAnswers>} partial - Flags already provided.
 * @returns {Promise<ScaffoldAnswers>} Complete answers.
 */
async function promptAnswers(
  partial: Partial<ScaffoldAnswers>,
): Promise<ScaffoldAnswers> {
  const rl = createInterface({ input, output });

  try {
    let name = partial.name;
    if (!name) {
      name = (await rl.question('Name (kebab-case): ')).trim();
    }

    let mode = partial.mode;
    if (!mode) {
      const interactive = (
        await rl.question('Needs client interactivity? [y/N]: ')
      )
        .trim()
        .toLowerCase();
      mode = interactive === 'y' || interactive === 'yes' ? 'island' : 'page';
    }

    let withStyles = partial.withStyles ?? false;
    if (mode === 'island' && partial.withStyles === undefined) {
      const styles = (
        await rl.question(
          'Needs interaction-specific styles beyond the shell? [y/N]: ',
        )
      )
        .trim()
        .toLowerCase();
      withStyles = styles === 'y' || styles === 'yes';
    }

    return { name: name ?? '', mode, withStyles };
  } finally {
    rl.close();
  }
}

/**
 * CLI entry: parse flags, prompt if needed, write files, print next steps.
 *
 * @returns {Promise<void>}
 */
async function main(): Promise<void> {
  const argv = process.argv.slice(2);
  const parsed = parseScaffoldArgs(argv);

  if (parsed.help) {
    printHelp();
    return;
  }

  const answers =
    parsed.name && parsed.mode
      ? {
          name: parsed.name,
          mode: parsed.mode,
          withStyles: parsed.withStyles ?? false,
        }
      : await promptAnswers(parsed);

  const plan = resolveScaffoldPlan(answers);
  const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), '..');
  await loadAndApplyArchipielagoConfig(rootDir);
  const { written, notes } = await applyScaffoldPlan(rootDir, plan);

  output.write(`Scaffolded ${plan.mode} "${plan.name}":\n`);
  for (const path of written) {
    output.write(`  ${path.replace(`${rootDir}/`, '')}\n`);
  }
  for (const note of notes) {
    output.write(`\n${note}\n`);
  }

  if (plan.mode === 'page') {
    output.write(`
Next steps:
  1. Add "${plan.name}" to PageLocalsMap in src/web/protocol/page-props/page-props.ts
  2. Add a WebController method with @Render('${plan.name}') that returns
     WebViewLocals (page locals plus csrfToken and pageStylesheets)
  3. Style with shell classes only — see docs/how-to-web-ui.md
`);
  } else {
    output.write(`
Next steps:
  1. Include the island from a Handlebars view: {{{hydrate "${plan.name}"}}}
  2. Run pnpm dehydrate so the HTML (and CSS sidecar, when present) exist
  3. Hydrate loaders pick up the conventional folder via glob
  Browse with pnpm storybook. See docs/how-to-web-ui.md
`);
  }
}

const isDirectRun =
  process.argv[1] !== undefined &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isDirectRun) {
  main().catch((error: unknown) => {
    const message = error instanceof Error ? error.message : String(error);
    console.error(message);
    process.exitCode = 1;
  });
}
