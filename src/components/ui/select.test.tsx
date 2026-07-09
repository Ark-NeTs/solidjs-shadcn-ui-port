import { render, screen } from '@solidjs/testing-library';
import { describe, expect, it } from 'vitest';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';

const renderSelect = (props: { open?: boolean } = {}) =>
  render(() => (
    <Select
      {...props}
      options={['Apple', 'Banana']}
      placeholder="Pick a fruit"
      itemComponent={(itemProps) => (
        <SelectItem item={itemProps.item}>{itemProps.item.rawValue}</SelectItem>
      )}
    >
      <SelectTrigger aria-label="Fruit">
        <SelectValue<string>>{(state) => state.selectedOption()}</SelectValue>
      </SelectTrigger>
      <SelectContent />
    </Select>
  ));

describe('Select', () => {
  it('renders a trigger', () => {
    // Kobalte points the trigger's accessible name at its value via
    // aria-labelledby, so match the single trigger button by role, not name.
    const { getByRole } = renderSelect();
    expect(getByRole('button')).toBeInTheDocument();
  });

  it('renders its options when open', () => {
    renderSelect({ open: true });
    expect(screen.getByRole('option', { name: 'Apple' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Banana' })).toBeInTheDocument();
  });
});
