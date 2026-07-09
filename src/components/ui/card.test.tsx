import { render } from '@solidjs/testing-library';
import { describe, expect, it } from 'vitest';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './card';

describe('Card', () => {
  it('composes header, title, description, content and footer', () => {
    const { getByText } = render(() => (
      <Card>
        <CardHeader>
          <CardTitle>Bella Vista</CardTitle>
          <CardDescription>Italian restaurant</CardDescription>
        </CardHeader>
        <CardContent>Body</CardContent>
        <CardFooter>Footer</CardFooter>
      </Card>
    ));
    for (const text of ['Bella Vista', 'Italian restaurant', 'Body', 'Footer']) {
      expect(getByText(text)).toBeInTheDocument();
    }
  });

  it('renders the title as an h3 and the card as a bordered surface', () => {
    const { getByText, container } = render(() => (
      <Card>
        <CardTitle>T</CardTitle>
      </Card>
    ));
    expect(getByText('T').tagName).toBe('H3');
    expect(container.firstChild).toHaveClass('bg-card', 'border');
  });
});
