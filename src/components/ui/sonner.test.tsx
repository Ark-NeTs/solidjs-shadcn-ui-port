import { render, screen } from '@solidjs/testing-library';
import { describe, expect, it } from 'vitest';
import { toast } from 'solid-sonner';
import { Toaster } from './sonner';

describe('Toaster (sonner)', () => {
  it('renders a toast dispatched through the sonner API', async () => {
    render(() => <Toaster />);
    toast('Changes saved');
    expect(await screen.findByText('Changes saved')).toBeInTheDocument();
  });
});
