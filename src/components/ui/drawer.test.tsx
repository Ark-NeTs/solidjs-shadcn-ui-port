import { render, screen } from '@solidjs/testing-library';
import { describe, expect, it } from 'vitest';
import { Drawer, DrawerContent, DrawerDescription, DrawerTitle } from './drawer';

describe('Drawer', () => {
  it('renders its content when open', () => {
    render(() => (
      <Drawer open>
        <DrawerContent>
          <DrawerTitle>Navigation</DrawerTitle>
          <DrawerDescription>Jump to a section</DrawerDescription>
        </DrawerContent>
      </Drawer>
    ));
    expect(screen.getByText('Navigation')).toBeInTheDocument();
    expect(screen.getByText('Jump to a section')).toBeInTheDocument();
  });
});
