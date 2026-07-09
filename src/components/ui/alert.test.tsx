import { render } from '@solidjs/testing-library';
import { describe, expect, it } from 'vitest';
import { Alert, AlertDescription, AlertTitle } from './alert';

describe('Alert', () => {
  it('renders with the alert role and its title/description', () => {
    const { getByRole, getByText } = render(() => (
      <Alert>
        <AlertTitle>Heads up</AlertTitle>
        <AlertDescription>Changes save automatically</AlertDescription>
      </Alert>
    ));
    expect(getByRole('alert')).toHaveClass('bg-background');
    expect(getByText('Heads up')).toBeInTheDocument();
    expect(getByText('Changes save automatically')).toBeInTheDocument();
  });

  it('applies the destructive variant', () => {
    const { getByRole } = render(() => (
      <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
      </Alert>
    ));
    expect(getByRole('alert')).toHaveClass('text-destructive');
  });
});
