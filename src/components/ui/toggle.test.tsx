import { fireEvent, render } from '@solidjs/testing-library';
import { describe, expect, it } from 'vitest';
import { Toggle } from './toggle';

describe('Toggle', () => {
  it('renders an unpressed toggle button by default', () => {
    const { getByRole } = render(() => <Toggle>B</Toggle>);
    expect(getByRole('button')).toHaveAttribute('aria-pressed', 'false');
  });

  it('toggles the pressed state on click', () => {
    const { getByRole } = render(() => <Toggle>B</Toggle>);
    const btn = getByRole('button');
    fireEvent.click(btn);
    expect(btn).toHaveAttribute('aria-pressed', 'true');
  });

  it('applies the outline variant classes', () => {
    const { getByRole } = render(() => <Toggle variant="outline">B</Toggle>);
    expect(getByRole('button')).toHaveClass('border', 'border-input');
  });
});
