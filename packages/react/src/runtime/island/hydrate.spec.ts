import { act, createElement, useState, type ReactElement } from 'react';
import { renderToString } from 'react-dom/server';
import userEvent from '@testing-library/user-event';
import { hydrateIslands } from './hydrate';
import {
  resetIslandLoadersCache,
  resetIslandModules,
  setIslandModules,
} from './registry';

/**
 * In-package toggle stub so hydrate tests do not import Nest product islands.
 *
 * @returns {ReactElement} Button whose aria-expanded flips on click.
 */
function ToggleStub(): ReactElement {
  const [open, setOpen] = useState(false);
  return createElement(
    'button',
    {
      type: 'button',
      'aria-expanded': open ? 'true' : 'false',
      onClick: () => {
        setOpen(true);
      },
    },
    'Toggle',
  );
}

describe('hydrate islands', () => {
  beforeEach(() => {
    setIslandModules({
      '../../islands/toggle-stub/toggle-stub.tsx': async () => ({
        default: ToggleStub,
      }),
    });
    resetIslandLoadersCache();
  });

  afterEach(() => {
    resetIslandModules();
    document.body.innerHTML = '';
  });

  it('opens the stub drawer when the toggle is clicked', async () => {
    const inner = renderToString(createElement(ToggleStub));
    document.body.innerHTML = `<div data-component-name="toggle-stub" data-component-props="{}">${inner}</div>`;

    await hydrateIslands(document);

    const button = document.querySelector('button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('aria-expanded', 'false');

    await act(async () => {
      await userEvent.click(button!);
    });

    expect(button).toHaveAttribute('aria-expanded', 'true');
  });

  it('skips a wrapper that names an unknown island', async () => {
    document.body.innerHTML =
      '<div data-component-name="chart" data-component-props="{}"></div>';

    await expect(hydrateIslands(document)).resolves.toBeUndefined();
  });
});
