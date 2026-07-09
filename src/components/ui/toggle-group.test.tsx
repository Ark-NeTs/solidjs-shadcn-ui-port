import { fireEvent, render } from '@solidjs/testing-library';
import { describe, expect, it } from 'vitest';
import { ToggleGroup, ToggleGroupItem } from './toggle-group';

const renderGroup = () =>
  render(() => (
    <ToggleGroup>
      <ToggleGroupItem value="mon">Mon</ToggleGroupItem>
      <ToggleGroupItem value="tue">Tue</ToggleGroupItem>
    </ToggleGroup>
  ));

describe('ToggleGroup', () => {
  it('renders each item', () => {
    const { getByText } = renderGroup();
    expect(getByText('Mon')).toBeInTheDocument();
    expect(getByText('Tue')).toBeInTheDocument();
  });

  it('marks the clicked item as pressed', () => {
    const { getByText } = renderGroup();
    const mon = getByText('Mon');
    fireEvent.click(mon);
    expect(mon).toHaveAttribute('data-pressed');
  });
});
