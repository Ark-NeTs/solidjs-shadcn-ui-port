import { render, screen } from '@solidjs/testing-library';
import { describe, expect, it } from 'vitest';
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from './sheet';

describe('Sheet', () => {
  it('is closed initially', () => {
    render(() => (
      <Sheet>
        <SheetTrigger>Open</SheetTrigger>
        <SheetContent>
          <SheetTitle>Item detail</SheetTitle>
        </SheetContent>
      </Sheet>
    ));
    expect(screen.queryByText('Item detail')).toBeNull();
  });

  it('anchors to the right edge by default when open', () => {
    render(() => (
      <Sheet open>
        <SheetContent>
          <SheetTitle>Item detail</SheetTitle>
        </SheetContent>
      </Sheet>
    ));
    expect(screen.getByText('Item detail')).toBeInTheDocument();
    expect(screen.getByRole('dialog')).toHaveClass('right-0');
  });

  it('anchors to the left with position="left"', () => {
    render(() => (
      <Sheet open>
        <SheetContent position="left">
          <SheetTitle>Navigation</SheetTitle>
        </SheetContent>
      </Sheet>
    ));
    expect(screen.getByRole('dialog')).toHaveClass('left-0');
  });
});
