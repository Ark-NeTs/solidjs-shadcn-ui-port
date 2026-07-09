import { fireEvent, render } from '@solidjs/testing-library';
import { describe, expect, it } from 'vitest';
import { TextField, TextFieldInput, TextFieldLabel, TextFieldTextArea } from './text-field';

describe('TextField', () => {
  it('associates its label with the input', () => {
    const { getByLabelText } = render(() => (
      <TextField>
        <TextFieldLabel>Restaurant name</TextFieldLabel>
        <TextFieldInput placeholder="e.g. Bella Vista" />
      </TextField>
    ));
    expect(getByLabelText('Restaurant name')).toBeInstanceOf(HTMLInputElement);
  });

  it('accepts typed input', () => {
    const { getByLabelText } = render(() => (
      <TextField>
        <TextFieldLabel>Name</TextFieldLabel>
        <TextFieldInput />
      </TextField>
    ));
    const input = getByLabelText('Name') as HTMLInputElement;
    fireEvent.input(input, { target: { value: 'Ann' } });
    expect(input).toHaveValue('Ann');
  });

  it('can render a textarea instead of an input', () => {
    const { getByLabelText } = render(() => (
      <TextField>
        <TextFieldLabel>Description</TextFieldLabel>
        <TextFieldTextArea />
      </TextField>
    ));
    expect(getByLabelText('Description')).toBeInstanceOf(HTMLTextAreaElement);
  });
});
