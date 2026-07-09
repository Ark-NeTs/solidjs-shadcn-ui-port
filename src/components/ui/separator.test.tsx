import { render } from '@solidjs/testing-library';
import { describe, expect, it } from 'vitest';
import { Separator } from './separator';

describe('Separator', () => {
  it('is horizontal by default', () => {
    const { container } = render(() => <Separator />);
    const el = container.querySelector('hr') ?? (container.firstChild as HTMLElement);
    expect(el).toHaveClass('bg-border', 'h-px', 'w-full');
  });

  it('supports a vertical orientation', () => {
    const { container } = render(() => <Separator orientation="vertical" />);
    const el = container.querySelector('hr') ?? (container.firstChild as HTMLElement);
    expect(el).toHaveClass('h-full', 'w-px');
  });
});
