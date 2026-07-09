import { fireEvent, render, screen } from '@solidjs/testing-library';
import { describe, expect, it } from 'vitest';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './accordion';

describe('Accordion', () => {
  it('renders a collapsed item trigger', () => {
    render(() => (
      <Accordion collapsible>
        <AccordionItem value="hours">
          <AccordionTrigger>Opening hours</AccordionTrigger>
          <AccordionContent>9am - 11pm</AccordionContent>
        </AccordionItem>
      </Accordion>
    ));
    expect(screen.getByRole('button', { name: 'Opening hours' })).toBeInTheDocument();
  });

  it('expands the item when its trigger is clicked', () => {
    render(() => (
      <Accordion collapsible>
        <AccordionItem value="hours">
          <AccordionTrigger>Opening hours</AccordionTrigger>
          <AccordionContent>9am - 11pm</AccordionContent>
        </AccordionItem>
      </Accordion>
    ));
    fireEvent.click(screen.getByRole('button', { name: 'Opening hours' }));
    expect(screen.getByText('9am - 11pm')).toBeVisible();
  });
});
