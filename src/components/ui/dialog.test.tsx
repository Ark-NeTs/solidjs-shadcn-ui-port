import { render, screen } from '@solidjs/testing-library';
import { describe, expect, it } from 'vitest';
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from './dialog';

describe('Dialog', () => {
  it('keeps portalled content out of the DOM while closed', () => {
    render(() => (
      <Dialog>
        <DialogTrigger>Open</DialogTrigger>
        <DialogContent>
          <DialogTitle>Settings</DialogTitle>
        </DialogContent>
      </Dialog>
    ));
    expect(screen.queryByText('Settings')).toBeNull();
  });

  it('renders content in a portal when open', () => {
    render(() => (
      <Dialog open>
        <DialogContent>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>Manage your preferences</DialogDescription>
        </DialogContent>
      </Dialog>
    ));
    // Portalled to document.body, so query via `screen`, not the container.
    expect(screen.getByText('Settings')).toBeInTheDocument();
    expect(screen.getByText('Manage your preferences')).toBeInTheDocument();
  });
});
