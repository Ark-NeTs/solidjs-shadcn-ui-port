import { render } from '@solidjs/testing-library';
import { describe, expect, it } from 'vitest';
import { Button, buttonVariants } from './button';

describe('Button', () => {
  it('renders a native button with its children', () => {
    const { getByRole } = render(() => <Button>Click</Button>);
    expect(getByRole('button', { name: 'Click' })).toBeInTheDocument();
  });

  it('applies the default variant + size classes', () => {
    const { getByRole } = render(() => <Button>Go</Button>);
    expect(getByRole('button')).toHaveClass('bg-primary', 'h-10');
  });

  it('applies variant and size overrides', () => {
    const { getByRole } = render(() => (
      <Button variant="outline" size="sm">
        Go
      </Button>
    ));
    expect(getByRole('button')).toHaveClass('border-input', 'h-9');
  });

  it('merges a caller-supplied class', () => {
    const { getByRole } = render(() => <Button class="custom-x">Go</Button>);
    expect(getByRole('button')).toHaveClass('custom-x', 'bg-primary');
  });

  it('exposes buttonVariants for composition', () => {
    expect(buttonVariants({ variant: 'ghost' })).toContain('hover:bg-accent');
  });
});
