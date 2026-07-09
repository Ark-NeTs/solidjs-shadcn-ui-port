import { fireEvent, render } from '@solidjs/testing-library';
import { describe, expect, it } from 'vitest';
import {
  NumberField,
  NumberFieldDecrementTrigger,
  NumberFieldGroup,
  NumberFieldIncrementTrigger,
  NumberFieldInput,
} from './number-field';

const renderField = () =>
  render(() => (
    <NumberField defaultValue={2}>
      <NumberFieldGroup>
        <NumberFieldInput aria-label="Tables" />
        <NumberFieldIncrementTrigger aria-label="Increment" />
        <NumberFieldDecrementTrigger aria-label="Decrement" />
      </NumberFieldGroup>
    </NumberField>
  ));

describe('NumberField', () => {
  it('seeds the input with the default value', () => {
    const { getByLabelText } = renderField();
    expect(getByLabelText('Tables')).toHaveValue('2');
  });

  it('renders increment and decrement triggers', () => {
    const { getByLabelText } = renderField();
    expect(getByLabelText('Increment')).toBeInTheDocument();
    expect(getByLabelText('Decrement')).toBeInTheDocument();
  });

  it('increments via the ArrowUp key', () => {
    const { getByLabelText } = renderField();
    const input = getByLabelText('Tables');
    fireEvent.keyDown(input, { key: 'ArrowUp' });
    expect(input).toHaveValue('3');
  });
});
