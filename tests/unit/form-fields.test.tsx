// Verify native form contracts and reactive composition for the D19 field exports.
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@solidjs/testing-library';
import { createSignal, flush } from 'solid-js';
import { Input, Textarea, Label } from '../../src';

describe('native form fields', () => {
  it.each([Input, Textarea])('forwards refs, native attributes, input/change handlers and default values', Field => {
    let ref: HTMLInputElement | HTMLTextAreaElement | undefined;
    const input=vi.fn();const change=vi.fn();
    render(() => <form data-testid="form"><Label for="field">Draft</Label><Field id="field" name="draft" defaultValue="Original" required maxlength={40} aria-describedby="help" ref={(element: HTMLInputElement | HTMLTextAreaElement) => {ref=element;}} onInput={input} onChange={change} class="rounded-none" /><p id="help">Keep this draft short.</p></form>);
    const field=screen.getByRole('textbox',{name:'Draft'});
    expect(ref).toBe(field);expect(field).toHaveValue('Original');expect(field).toBeRequired();expect(field).toHaveAccessibleDescription('Keep this draft short.');expect(field).toHaveAttribute('maxlength','40');expect(field).toHaveClass('rounded-none');expect(field).not.toHaveClass('rounded-lg');
    fireEvent.input(field,{target:{value:'Edited'}});fireEvent.change(field);
    expect(input).toHaveBeenCalledTimes(1);expect(change).toHaveBeenCalledTimes(1);
    const form=screen.getByTestId('form') as HTMLFormElement;
    expect(new FormData(form).get('draft')).toBe('Edited');form.reset();expect(field).toHaveValue('Original');
  });
  it.each([Input, Textarea])('updates controlled values, native states, label association and classes without replacing the node', Field => {
    const [value,setValue]=createSignal('Initial');const [locked,setLocked]=createSignal(false);
    render(() => <><Label for={locked()?'updated':'draft'}>{locked()?'Locked':'Draft'}</Label><Field id={locked()?'updated':'draft'} value={value()} onInput={(event: InputEvent & {currentTarget: HTMLInputElement | HTMLTextAreaElement}) => setValue(event.currentTarget.value)} disabled={locked()} readonly={locked()} aria-invalid={locked()?'true':'false'} class={locked()?'rounded-none':'rounded-xl'} /></>);
    const field=screen.getByRole('textbox',{name:'Draft'});fireEvent.input(field,{target:{value:'Typed'}});flush();expect(value()).toBe('Typed');
    setValue('External update');setLocked(true);flush();
    expect(screen.getByRole('textbox',{name:'Locked'})).toBe(field);expect(field).toHaveValue('External update');expect(field).toBeDisabled();expect(field).toHaveAttribute('readonly');expect(field).toHaveAttribute('aria-invalid','true');expect(field).toHaveClass('rounded-none');expect(field).not.toHaveClass('rounded-xl');
  });
  it('preserves input types and file attributes reactively', () => {
    const [type,setType]=createSignal<'email'|'password'>('email');
    render(() => <><Input aria-label="Account" type={type()} autocomplete="email" /><Input aria-label="File" type="file" accept=".txt" multiple /></>);
    const input=screen.getByLabelText('Account');expect(input).toHaveAttribute('type','email');setType('password');flush();expect(input).toHaveAttribute('type','password');expect(input).toHaveAttribute('autocomplete','email');expect(screen.getByLabelText('File')).toHaveAttribute('multiple');expect(screen.getByLabelText('File')).toHaveAttribute('accept','.txt');
  });
  it('forwards label ref/events/classes and textarea dimensions', () => {
    const click=vi.fn();let ref: HTMLLabelElement | undefined;
    render(() => <><Label for="notes" ref={element => {ref=element;}} class="gap-4" onClick={click}>Notes</Label><Textarea id="notes" rows={4} cols={30} wrap="soft" /></>);
    const label=screen.getByText('Notes');expect(ref).toBe(label);expect(label).toHaveClass('gap-4');expect(label).not.toHaveClass('gap-2');fireEvent.click(label);expect(click).toHaveBeenCalledTimes(1);expect(screen.getByRole('textbox')).toHaveAttribute('rows','4');expect(screen.getByRole('textbox')).toHaveAttribute('cols','30');expect(screen.getByRole('textbox')).toHaveAttribute('wrap','soft');
  });
});

it.each(['old', 'new'] as const)('refreshes a stale %s target collection without replacing label content or focus', stale => {
  const [target, setTarget] = createSignal('first');
  const ref = vi.fn();
  const { unmount } = render(() => <><Label for={target()} ref={ref}><span>Live name</span></Label><Input id="first"/><Textarea id="second" defaultValue="Keep this draft"/></>);
  const label = document.querySelector('label')!;
  const child = label.firstChild;
  const first = document.getElementById('first') as HTMLInputElement;
  const second = document.getElementById('second') as HTMLTextAreaElement;
  // jsdom does not reproduce Firefox's stale native collections; simulate either side.
  if (stale === 'old') vi.spyOn(first, 'labels', 'get').mockReturnValue(document.querySelectorAll('label'));
  else vi.spyOn(second, 'labels', 'get').mockReturnValue(document.querySelectorAll('label.missing'));
  const append = vi.spyOn(label, 'append');
  second.focus(); second.setSelectionRange(2, 5);
  setTarget('second'); flush();
  expect(append).toHaveBeenCalledTimes(1);
  expect(label.control).toBe(second);
  expect(label.firstChild).toBe(child);
  expect(label.childNodes).toHaveLength(1);
  expect(ref).toHaveBeenCalledExactlyOnceWith(label);
  expect(second).toHaveFocus(); expect(second).toHaveValue('Keep this draft');
  expect([second.selectionStart, second.selectionEnd]).toEqual([2, 5]);
  unmount(); setTarget('first'); flush();
  expect(append).toHaveBeenCalledTimes(1);
});

it('leaves healthy and missing associations alone and refreshes a stale removed association', () => {
  const [target, setTarget] = createSignal<string | undefined>('first');
  render(() => <><Label for={target()}>Live name</Label><Input id="first"/><Textarea id="second"/></>);
  const label = document.querySelector('label')!;
  const first = document.getElementById('first') as HTMLInputElement;
  const append = vi.spyOn(label, 'append');
  setTarget('second'); flush();
  expect(label.control).toBe(document.getElementById('second'));
  expect(append).not.toHaveBeenCalled();
  setTarget('first'); flush();
  vi.spyOn(first, 'labels', 'get').mockReturnValue(document.querySelectorAll('label'));
  setTarget(undefined); flush();
  expect(label.control).toBeNull(); expect(label).not.toHaveAttribute('for');
  expect(append).toHaveBeenCalledTimes(1);
  setTarget('missing'); flush();
  expect(append).toHaveBeenCalledTimes(1);
});
