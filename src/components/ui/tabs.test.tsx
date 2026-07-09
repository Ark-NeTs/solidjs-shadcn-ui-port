import { fireEvent, render } from '@solidjs/testing-library';
import { describe, expect, it } from 'vitest';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs';

const setup = () =>
  render(() => (
    <Tabs defaultValue="a">
      <TabsList>
        <TabsTrigger value="a">Tab A</TabsTrigger>
        <TabsTrigger value="b">Tab B</TabsTrigger>
      </TabsList>
      <TabsContent value="a">Panel A</TabsContent>
      <TabsContent value="b">Panel B</TabsContent>
    </Tabs>
  ));

describe('Tabs', () => {
  it('renders triggers with the tab role', () => {
    const { getAllByRole } = setup();
    expect(getAllByRole('tab')).toHaveLength(2);
  });

  it('shows the default tab panel', () => {
    const { getByText } = setup();
    expect(getByText('Panel A')).toBeVisible();
  });

  it('switches the visible panel when another trigger is clicked', () => {
    const { getByRole, getByText } = setup();
    fireEvent.click(getByRole('tab', { name: 'Tab B' }));
    expect(getByText('Panel B')).toBeVisible();
  });
});
