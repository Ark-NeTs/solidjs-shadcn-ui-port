// Progress naming, derived values and lifecycle through the public API; D19/D90.
import { it, expect, vi } from 'vitest';
import { render, screen } from '@solidjs/testing-library';
import { createSignal, flush } from 'solid-js';
import { Progress } from '../../src';

it('renders named progress, forwarded attributes/ref and merged classes', () => {
  const ref = vi.fn();
  render(() => <><span id="job">Export</span><p id="help">Keep this page open</p><Progress value={25} aria-labelledby="job" aria-describedby="help" ref={ref} id="progress" class="h-3" style={{opacity:'.8'}} /></>);
  const root = screen.getByRole('progressbar', {name:'Export'});
  expect(root).toHaveAttribute('aria-valuenow','25');expect(root).toHaveAttribute('aria-valuemin','0');expect(root).toHaveAttribute('aria-valuemax','100');expect(root).toHaveAttribute('aria-valuetext','25%');expect(root).toHaveAttribute('aria-describedby','help');expect(root).toHaveClass('h-3');expect(root).not.toHaveClass('h-1');expect(root).toHaveStyle({opacity:'.8'});expect(ref).toHaveBeenCalledWith(root);
});
it('keeps zero, fractional and complete values and the same root/indicator as the owner updates', () => {
  const [value,setValue]=createSignal<number|null>(0);const [max,setMax]=createSignal(10);
  render(() => <Progress value={value()} max={max()} aria-label="Upload"/>);
  const root=screen.getByRole('progressbar');const fill=root.firstElementChild;
  expect(root).toHaveAttribute('data-state','loading');expect(root).toHaveAttribute('aria-valuenow','0');setValue(2.5);flush();expect(root).toHaveAttribute('aria-valuetext','25%');expect(fill).toHaveStyle({width:'25%'});setValue(10);flush();expect(root).toHaveAttribute('data-state','complete');setMax(20);flush();expect(root).toHaveAttribute('data-state','loading');expect(root).toHaveAttribute('aria-valuetext','50%');expect(root.firstElementChild).toBe(fill);expect(screen.getByRole('progressbar')).toBe(root);
});
it('uses an indeterminate state for missing, null, nonfinite and out-of-range values and recovers', () => {
  const [value,setValue]=createSignal<number|null|undefined>();render(()=><Progress value={value()} aria-label="Processing"/>);const root=screen.getByRole('progressbar');
  for(const next of [undefined,null,NaN,Infinity,-1,101]){setValue(next);flush();expect(root).toHaveAttribute('data-state','indeterminate');expect(root).not.toHaveAttribute('aria-valuenow');expect(root).not.toHaveAttribute('aria-valuetext');expect(root.firstElementChild).toHaveStyle({width:'40%'});}
  setValue(50);flush();expect(root).toHaveAttribute('aria-valuenow','50');expect(root).toHaveAttribute('data-state','loading');
});
it('falls back to max 100 for invalid bounds without changing owner data', () => {
  const [max,setMax]=createSignal<number|undefined>();render(()=><Progress value={50} max={max()} aria-label="Task"/>);const root=screen.getByRole('progressbar');
  for(const next of [undefined,0,-1,NaN,Infinity]){setMax(next);flush();expect(root).toHaveAttribute('aria-valuemax','100');expect(root).toHaveAttribute('aria-valuenow','50');}setMax(25);flush();expect(root).toHaveAttribute('data-state','indeterminate');expect(max()).toBe(25);setMax(50);flush();expect(root).toHaveAttribute('data-state','complete');
});
it('updates custom value text and external labels while ignoring percentage text during unknown work', () => {
  const [text,setText]=createSignal<string|undefined>();const [label,setLabel]=createSignal('first');const [value,setValue]=createSignal<number|null>(3);const format=vi.fn((v:number,m:number)=>`${v} of ${m} tasks`);
  render(()=><><span id="first">First task</span><span id="second">Second task</span><Progress aria-labelledby={label()} aria-valuetext={text()} value={value()} max={10} getValueLabel={format}/></>);const root=screen.getByRole('progressbar',{name:'First task'});expect(root).toHaveAttribute('aria-valuetext','3 of 10 tasks');setText('Three finished');setLabel('second');flush();expect(root).toHaveAccessibleName('Second task');expect(root).toHaveAttribute('aria-valuetext','Three finished');setValue(null);flush();expect(root).not.toHaveAttribute('aria-valuetext');setValue(10);setText(undefined);flush();expect(root).toHaveAttribute('aria-valuetext','10 of 10 tasks');
});
it('does not submit form data or take keyboard focus by default and disposes with its owner', () => {
  const [value,setValue]=createSignal(25);const view=render(()=><form data-testid="form"><Progress value={value()} aria-label="Work"/><button>Continue</button></form>);const root=screen.getByRole('progressbar');expect(root.tabIndex).toBe(-1);expect(Array.from(new FormData(screen.getByTestId('form') as HTMLFormElement))).toEqual([]);view.unmount();setValue(50);flush();expect(root.isConnected).toBe(false);expect(screen.queryByRole('progressbar')).toBeNull();
});
