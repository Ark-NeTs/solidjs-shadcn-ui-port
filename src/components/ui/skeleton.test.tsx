import { render } from '@solidjs/testing-library';
import { describe, expect, it } from 'vitest';
import { Skeleton } from './skeleton';

describe('Skeleton', () => {
  it('renders a placeholder surface and merges sizing classes', () => {
    const { container } = render(() => <Skeleton class="size-10" />);
    const el = container.firstChild as HTMLElement;
    expect(el).toHaveClass('bg-primary/10', 'size-10');
  });
});
