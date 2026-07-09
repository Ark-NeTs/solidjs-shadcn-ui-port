import { render, screen } from '@solidjs/testing-library';
import { describe, expect, it } from 'vitest';
import { Tooltip, TooltipContent, TooltipTrigger } from './tooltip';

describe('Tooltip', () => {
  it('shows its content when open', () => {
    render(() => (
      <Tooltip open>
        <TooltipTrigger>Delete</TooltipTrigger>
        <TooltipContent>Remove element</TooltipContent>
      </Tooltip>
    ));
    expect(screen.getByText('Remove element')).toBeInTheDocument();
  });
});
