import type { ComponentType } from 'react';

/** Kebab-case island folder name (`login-form`, `mobile-navigation`). */
export type IslandName = string;

/**
 * Default export of a client island module.
 *
 * The hydrate runtime renders this component inside the server-rendered marker.
 */
export interface IslandModule {
  default: ComponentType<Record<string, unknown>>;
}
