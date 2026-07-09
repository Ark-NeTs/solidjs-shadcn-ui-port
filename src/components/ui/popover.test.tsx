import { render, screen } from '@solidjs/testing-library';
import { describe, expect, it } from 'vitest';
import { Popover, PopoverContent, PopoverTrigger } from './popover';

describe('Popover', () => {
  it('keeps content out of the DOM while closed', () => {
    render(() => (
      <Popover>
        <PopoverTrigger>Account</PopoverTrigger>
        <PopoverContent>Sign out</PopoverContent>
      </Popover>
    ));
    expect(screen.queryByText('Sign out')).toBeNull();
  });

  it('renders content in a portal when open', () => {
    render(() => (
      <Popover open>
        <PopoverTrigger>Account</PopoverTrigger>
        <PopoverContent>Sign out</PopoverContent>
      </Popover>
    ));
    expect(screen.getByText('Sign out')).toBeInTheDocument();
  });
});
