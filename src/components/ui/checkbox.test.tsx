import { fireEvent, render } from '@solidjs/testing-library';
import { describe, expect, it } from 'vitest';
import { Checkbox } from './checkbox';

describe('Checkbox', () => {
  it('is unchecked by default', () => {
    const { getByRole } = render(() => <Checkbox />);
    expect(getByRole('checkbox')).not.toBeChecked();
  });

  it('reflects the controlled checked prop', () => {
    const { getByRole } = render(() => <Checkbox checked />);
    expect(getByRole('checkbox')).toBeChecked();
  });

  it('toggles when clicked', () => {
    const { getByRole } = render(() => <Checkbox />);
    const input = getByRole('checkbox');
    fireEvent.click(input);
    expect(input).toBeChecked();
  });
});
