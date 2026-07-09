import { render } from '@solidjs/testing-library';
import { describe, expect, it } from 'vitest';
import { Badge } from './badge';

describe('Badge', () => {
  it('renders children with the default variant', () => {
    const { getByText } = render(() => <Badge>New</Badge>);
    expect(getByText('New')).toHaveClass('bg-primary');
  });

  it('applies the secondary variant', () => {
    const { getByText } = render(() => <Badge variant="secondary">Soon</Badge>);
    expect(getByText('Soon')).toHaveClass('bg-secondary');
  });

  it('applies a status variant that maps to a theme token', () => {
    const { getByText } = render(() => <Badge variant="success">Ready</Badge>);
    expect(getByText('Ready')).toHaveClass('bg-success', 'text-success-foreground');
  });

  it('renders as a pill with the round prop', () => {
    const { getByText } = render(() => <Badge round>1</Badge>);
    expect(getByText('1')).toHaveClass('rounded-full');
  });
});
