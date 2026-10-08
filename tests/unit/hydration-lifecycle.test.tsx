// Reproduce hydration's effect-before-ref ordering without mocking DOM behavior; D19/D90.
import { flush } from '@solidjs/signals';
import { it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@solidjs/testing-library';
vi.mock('solid-js', async importOriginal => {
  const solid = await importOriginal<typeof import('solid-js')>();
  return { ...solid, createEffect: ((compute: () => unknown, effect: (value: unknown) => void | (() => void), options?: object) => {
    // Only simulate the initial absent-node step; the real effect still owns later work and cleanup.
    solid.untrack(() => {
      const value = compute();
      if (value === undefined || (Array.isArray(value) && value[0] === undefined)) effect(value);
    });
    return solid.createEffect(compute, effect, options);
  }) as typeof solid.createEffect };
});
import { Input, Label, Tabs, TabsList, TabsTrigger, TabsContent, Combobox, ComboboxInput } from '../../src';

it('waits for label, tab-list and form bridge refs before synchronizing or observing DOM', () => {
  const { unmount } = render(() => <><Label for="late">Late label</Label><Input id="late"/>
    <Tabs defaultValue="one"><TabsList><TabsTrigger value="one">One</TabsTrigger><TabsTrigger value="two">Two</TabsTrigger></TabsList><TabsContent value="one">First panel</TabsContent><TabsContent value="two">Second panel</TabsContent></Tabs>
    <form data-testid="form"><Combobox items={['Apple']} defaultValue="Apple" name="fruit"><ComboboxInput aria-label="Late fruit"/></Combobox></form>
  </>);
  expect(screen.getByLabelText('Late label')).toHaveAttribute('id', 'late');
  fireEvent.click(screen.getByRole('tab', { name: 'Two' }));flush();expect(screen.getByRole('tabpanel')).toHaveTextContent('Second panel');
  expect(new FormData(screen.getByTestId('form') as HTMLFormElement).get('fruit')).toBe('Apple');
  unmount();expect(document.querySelector('label')).toBeNull();
});
