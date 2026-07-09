import { render } from '@solidjs/testing-library';
import { describe, expect, it } from 'vitest';
import { Label } from './label';

describe('Label', () => {
  it('renders a label element with its text', () => {
    const { getByText } = render(() => <Label>Email</Label>);
    expect(getByText('Email').tagName).toBe('LABEL');
  });

  it('forwards the `for` association', () => {
    const { getByText } = render(() => <Label for="email">Email</Label>);
    expect(getByText('Email')).toHaveAttribute('for', 'email');
  });
});
