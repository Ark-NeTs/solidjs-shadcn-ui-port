import { fireEvent, render, screen } from '@solidjs/testing-library';
import { describe, expect, it } from 'vitest';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './collapsible';

describe('Collapsible', () => {
  it('shows content when open by default', () => {
    render(() => (
      <Collapsible defaultOpen>
        <CollapsibleTrigger>See translations</CollapsibleTrigger>
        <CollapsibleContent>Turkish</CollapsibleContent>
      </Collapsible>
    ));
    expect(screen.getByText('Turkish')).toBeVisible();
  });

  it('reveals content when the trigger is clicked', () => {
    render(() => (
      <Collapsible>
        <CollapsibleTrigger>See translations</CollapsibleTrigger>
        <CollapsibleContent>Turkish</CollapsibleContent>
      </Collapsible>
    ));
    fireEvent.click(screen.getByText('See translations'));
    expect(screen.getByText('Turkish')).toBeVisible();
  });
});
