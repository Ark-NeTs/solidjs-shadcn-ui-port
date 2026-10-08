// Exercise server metadata paths with the browser renderer only as a markup inspection tool; D19/D90.
import { it, expect, vi } from 'vitest';
import { createRoot } from 'solid-js';
import { render, screen } from '@solidjs/testing-library';
vi.mock('@solidjs/web', async importOriginal => ({ ...await importOriginal<typeof import('@solidjs/web')>(), isServer: true }));
import { Input } from '../../src/components/ui/input';
import { createRegistration } from '../../src/lib/registration';

it('keeps server compound registrations mutable without reactive writes, including accessor values', () => {
  createRoot(dispose => {
  const initial = () => 'initial';const updated = () => 'updated';
  const [read, register, update] = createRegistration(initial);
  expect(read()).toBe(initial);register(updated);expect(read()()).toBe('updated');
  update(current => { expect(current).toBe(updated);return initial; });
  expect(read()).toBe(initial);dispose();
  });
});

it('serializes native input defaults while explicit values take precedence, including empty values', () => {
  render(() => <><Input aria-label="Default" defaultValue="server draft"/><Input aria-label="Controlled" value="current" defaultValue="baseline"/><Input aria-label="Empty" value="" defaultValue="baseline"/><Input aria-label="Missing"/></>);
  expect(screen.getByLabelText('Default')).toHaveValue('server draft');
  expect(screen.getByLabelText('Controlled')).toHaveValue('current');
  expect(screen.getByLabelText('Empty')).toHaveValue('');
  expect(screen.getByLabelText('Missing')).toHaveValue('');
  expect(screen.getByLabelText('Default')).not.toHaveAttribute('defaultvalue');
});
