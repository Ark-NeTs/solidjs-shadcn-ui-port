// Prove three-state/binary contracts, controlled rejection and reset lifecycle; D19.
import { it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@solidjs/testing-library';
import { createSignal, flush } from 'solid-js';
import { Checkbox, Switch, type CheckedState } from '../../src';

it.each([Checkbox,Switch])('handles native clicks, labels, refs and data-bound change callbacks',Control=>{
  let ref: HTMLInputElement | undefined;const checked=vi.fn();const change=vi.fn();const click=vi.fn();
  render(()=><><label for="toggle">Option</label><Control id="toggle" ref={(el: HTMLInputElement)=>{ref=el;}} name="option" value="yes" onCheckedChange={checked} onChange={[change,'change']} onClick={[click,'click']} /></>);
  const input=screen.getByLabelText('Option');expect(ref).toBe(input);expect(input).not.toBeChecked();fireEvent.click(input);flush();expect(input).toBeChecked();expect(checked).toHaveBeenCalledExactlyOnceWith(true);expect(change.mock.calls[0]?.[0]).toBe('change');expect(click.mock.calls[0]?.[0]).toBe('click');
  fireEvent.click(input);flush();expect(input).not.toBeChecked();expect(checked).toHaveBeenLastCalledWith(false);
});
it.each([Checkbox,Switch])('keeps controlled edits subject to the owner and reacts to external props',Control=>{
  const [checked,setChecked]=createSignal(false);const [disabled,setDisabled]=createSignal(false);const request=vi.fn();
  render(()=><Control aria-label="Controlled" checked={checked()} disabled={disabled()} class={disabled()?'rounded-none':'rounded-full'} onCheckedChange={request} />);
  const input=screen.getByLabelText('Controlled');fireEvent.click(input);flush();expect(request).toHaveBeenCalledExactlyOnceWith(true);expect(input).not.toBeChecked();setChecked(true);setDisabled(true);flush();expect(input).toBeChecked();expect(input).toBeDisabled();expect(input).toHaveClass('rounded-none');expect(input).not.toHaveClass('rounded-full');expect(input).toHaveAttribute('data-checked','');
});
it('renders mixed state, clears it on activation, and restores it on form reset',async()=>{
  const change=vi.fn();render(()=><form data-testid="form"><Checkbox aria-label="Mixed" defaultChecked="indeterminate" onCheckedChange={change} /></form>);
  const input=screen.getByRole('checkbox') as HTMLInputElement;expect(input.indeterminate).toBe(true);expect(input).toHaveAttribute('aria-checked','mixed');expect(input).toHaveAttribute('data-state','indeterminate');fireEvent.click(input);flush();expect(input).toBeChecked();expect(input.indeterminate).toBe(false);
  (screen.getByTestId('form') as HTMLFormElement).reset();await new Promise(resolve => setTimeout(resolve, 0));flush();expect(input.indeterminate).toBe(true);expect(input).not.toBeChecked();expect(change).toHaveBeenLastCalledWith('indeterminate');
});
it('accepts controlled mixed updates and normal change handlers',()=>{
  const [checked,setChecked]=createSignal<CheckedState>('indeterminate');const change=vi.fn();render(()=><Checkbox aria-label="Selection" checked={checked()} onCheckedChange={setChecked} onChange={change} />);
  const input=screen.getByRole('checkbox');fireEvent.click(input);flush();expect(checked()).toBe(true);expect(input).toBeChecked();setChecked(false);flush();expect(input).toHaveAttribute('aria-checked','false');expect(change).toHaveBeenCalledTimes(1);
});
it('cancels read-only and consumer-prevented clicks and change requests',()=>{
  const request=vi.fn();render(()=><><Checkbox aria-label="Read only" readonly onCheckedChange={request}/><Switch aria-label="Cancelled" onClick={event=>event.preventDefault()} onCheckedChange={request}/><Checkbox aria-label="Prevent change" onChange={event=>event.preventDefault()} onCheckedChange={request}/></>);
  fireEvent.click(screen.getByLabelText('Read only'));fireEvent.click(screen.getByLabelText('Cancelled'));
  const input=screen.getByLabelText('Prevent change') as HTMLInputElement;input.checked=true;fireEvent(input,new Event('change',{bubbles:true,cancelable:true}));flush();expect(input).not.toBeChecked();expect(request).not.toHaveBeenCalled();
});
it.each([Checkbox, Switch])('resets default-on controls even when disabled, honors cancelled resets and preserves native form values',async Control=>{
  render(()=><form data-testid="form"><Control name="enabled" aria-label="Enabled" defaultChecked value="yes"/><Switch name="locked" aria-label="Locked" defaultChecked disabled/></form>);
  const form=screen.getByTestId('form') as HTMLFormElement;const input=screen.getByLabelText('Enabled');expect(new FormData(form).get('enabled')).toBe('yes');expect(new FormData(form).has('locked')).toBe(false);fireEvent.click(input);flush();expect(new FormData(form).has('enabled')).toBe(false);
  const cancel=(event: Event)=>event.preventDefault();form.addEventListener('reset',cancel);form.reset();await new Promise(resolve => setTimeout(resolve, 0));flush();expect(input).not.toBeChecked();form.removeEventListener('reset',cancel);
  form.reset();await new Promise(resolve => setTimeout(resolve, 0));flush();expect(input).toBeChecked();expect(screen.getByLabelText('Locked')).toBeChecked();
});
it.each([Checkbox, Switch])('rebinds explicit form ownership, cancels queued resets after unmount, and cleans listeners',async Control=>{
  const [formId,setFormId]=createSignal('first');const request=vi.fn();const removed=vi.spyOn(HTMLFormElement.prototype,'removeEventListener');
  const {unmount}=render(()=><><form id="first"/><form id="second"/><Control aria-label="External" form={formId()} defaultChecked onCheckedChange={request}/></>);
  const input=screen.getByLabelText('External');fireEvent.click(input);flush();setFormId('second');flush();const first=document.getElementById('first') as HTMLFormElement;const second=document.getElementById('second') as HTMLFormElement;
  first.reset();await new Promise(resolve => setTimeout(resolve, 0));flush();expect(input).not.toBeChecked();second.reset();await new Promise(resolve => setTimeout(resolve, 0));flush();expect(input).toBeChecked();fireEvent.click(input);flush();second.reset();unmount();await new Promise(resolve => setTimeout(resolve, 0));expect(request).toHaveBeenCalledTimes(3);expect(removed).toHaveBeenCalledWith('reset',expect.any(Function));
});
it('updates switch size and allows uncontrolled use without callbacks',()=>{
  const [size,setSize]=createSignal<'sm'|'default'>('sm');render(()=><Switch aria-label="Size" size={size()}/>);const input=screen.getByRole('switch');expect(input).toHaveAttribute('data-size','sm');fireEvent.click(input);flush();expect(input).toHaveAttribute('aria-checked','true');setSize('default');flush();expect(input).toHaveAttribute('data-size','default');
});

it('keeps read-only switches checked and controlled values authoritative over reset defaults',async()=>{
  const request=vi.fn();render(()=><form data-testid="controlled-form"><Switch aria-label="Read-only switch" readonly defaultChecked onCheckedChange={request}/><Checkbox aria-label="Controlled off" checked={false} defaultChecked onCheckedChange={request}/></form>);
  const readonly=screen.getByRole('switch');fireEvent.click(readonly);flush();expect(readonly).toBeChecked();expect(readonly).toHaveAttribute('aria-readonly','true');const controlled=screen.getByLabelText('Controlled off');expect(controlled).not.toBeChecked();
  (screen.getByTestId('controlled-form') as HTMLFormElement).reset();await new Promise(resolve => setTimeout(resolve, 0));flush();expect(controlled).not.toBeChecked();expect(request).toHaveBeenCalledExactlyOnceWith(true);
});

it.each([Checkbox, Switch])('preserves state when ownership changes before queued reset synchronization', async Control => {
  const [owner, setOwner] = createSignal('old');
  const request = vi.fn();
  render(() => <><form id="old"/><form id="new"/><Control aria-label="Moving" name="preference" form={owner()} defaultChecked onCheckedChange={request}/></>);
  const input = screen.getByLabelText('Moving') as HTMLInputElement;
  fireEvent.click(input); flush();
  (document.getElementById('old') as HTMLFormElement).reset();
  setOwner('new'); flush();
  await new Promise(resolve => setTimeout(resolve, 0)); flush();
  expect(input.form?.id).toBe('new');
  expect(input).not.toBeChecked();
  expect(input).toHaveAttribute('aria-checked', 'false');
  expect(request).toHaveBeenCalledExactlyOnceWith(false);
  expect(new FormData(input.form!).has('preference')).toBe(false);
  (document.getElementById('new') as HTMLFormElement).reset();
  await new Promise(resolve => setTimeout(resolve, 0)); flush();
  expect(input).toBeChecked();
  expect(request).toHaveBeenLastCalledWith(true);
});
