import { fireEvent, render } from '@solidjs/testing-library';
import { describe, expect, it } from 'vitest';
import { Switch, SwitchControl, SwitchThumb } from './switch';

const renderSwitch = (props: { checked?: boolean } = {}) =>
  render(() => (
    <Switch {...props}>
      <SwitchControl>
        <SwitchThumb />
      </SwitchControl>
    </Switch>
  ));

describe('Switch', () => {
  it('renders an unchecked switch by default', () => {
    const { getByRole } = renderSwitch();
    expect(getByRole('switch')).not.toBeChecked();
  });

  it('reflects the controlled checked prop', () => {
    const { getByRole } = renderSwitch({ checked: true });
    expect(getByRole('switch')).toBeChecked();
  });

  it('toggles when clicked', () => {
    const { getByRole } = renderSwitch();
    const input = getByRole('switch');
    fireEvent.click(input);
    expect(input).toBeChecked();
  });
});
