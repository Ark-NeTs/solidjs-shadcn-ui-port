// Selection ownership, native forms, canceled activation and grouped keyboard behavior; D19/D90.
import { it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@solidjs/testing-library';
import { createSignal, createEffect, flush, Show, Errored } from 'solid-js';
import { RadioGroup, RadioGroupItem, Toggle, ToggleGroup, ToggleGroupItem, toggleVariants } from '../../src';
/** Wait for cancellation-aware reset synchronization. */
async function settle(){await new Promise(resolve=>setTimeout(resolve,0));flush();}
/** Give radio items native labels and a disabled middle option. */
function Radios(){return <><label><RadioGroupItem value="a"/>Alpha</label><label><RadioGroupItem value="b" disabled/>Beta</label><label><RadioGroupItem value="c"/>Gamma</label></>;}
it('adapts Kobalte Toggle state, native refs, canceled clicks and reactive controlled decisions',()=>{
 const [pressed,setPressed]=createSignal(false);const [cancel,setCancel]=createSignal(true);const [disabled,setDisabled]=createSignal(false);const change=vi.fn();const ref=vi.fn();const click=vi.fn((_data,e:MouseEvent)=>{if(cancel())e.preventDefault();});
 render(()=><Toggle pressed={pressed()} disabled={disabled()} onPressedChange={change} ref={ref} onClick={[click,'bound']} variant="outline" size="sm">Bold</Toggle>);
 const button=screen.getByRole('button');expect(ref).toHaveBeenCalledWith(button);fireEvent.click(button);flush();expect(change).not.toHaveBeenCalled();expect(button).toHaveAttribute('aria-pressed','false');setCancel(false);flush();fireEvent.click(button);flush();expect(change).toHaveBeenLastCalledWith(true);expect(button).toHaveAttribute('data-state','off');setPressed(true);setDisabled(true);flush();expect(button).toHaveAttribute('data-state','on');expect(button).toBeDisabled();expect(button).toHaveAttribute('type','button');
});
it('supports default and local Toggle state with variants and caller styles',()=>{
 render(()=><Toggle defaultPressed class="rounded-none">Italic</Toggle>);const button=screen.getByRole('button');expect(button).toHaveAttribute('aria-pressed','true');fireEvent.click(button);flush();expect(button).toHaveAttribute('aria-pressed','false');expect(button).toHaveClass('rounded-none');expect(toggleVariants({size:'lg'})).toContain('h-9');expect(toggleVariants()).toContain('h-8');
});
it('keeps native radio labels, form values and default resets synchronized',async()=>{
 const changed=vi.fn();render(()=><form data-testid="form"><RadioGroup name="delivery" defaultValue="a" onValueChange={changed}><Radios/></RadioGroup></form>);const form=screen.getByTestId('form') as HTMLFormElement;
 expect(new FormData(form).get('delivery')).toBe('a');fireEvent.click(screen.getByLabelText('Gamma'));flush();expect(screen.getByLabelText('Alpha')).not.toBeChecked();expect(new FormData(form).get('delivery')).toBe('c');form.reset();await settle();expect(screen.getByLabelText('Alpha')).toBeChecked();expect(changed.mock.calls.map(call=>call[0])).toEqual(['c','a']);
});
it('restores every controlled radio after rejection, including form reset',async()=>{
 const [value,setValue]=createSignal('c');const changed=vi.fn();render(()=><form data-testid="form"><RadioGroup name="choice" value={value()} defaultValue="a" onValueChange={changed}><Radios/></RadioGroup></form>);
 fireEvent.click(screen.getByLabelText('Alpha'));flush();expect(screen.getByLabelText('Alpha')).not.toBeChecked();expect(screen.getByLabelText('Gamma')).toBeChecked();(screen.getByTestId('form') as HTMLFormElement).reset();await settle();expect(screen.getByLabelText('Gamma')).toBeChecked();expect(changed.mock.calls.map(call=>call[0])).toEqual(['a','a']);setValue('a');flush();expect(screen.getByLabelText('Alpha')).toBeChecked();
});
it('honors canceled radio resets, rebinds form ownership and cancels pending disposal work',async()=>{
 const [owner,setOwner]=createSignal('first');const changed=vi.fn();const {unmount}=render(()=><><form id="first"/><form id="second"/><RadioGroup form={owner()} defaultValue="a" onValueChange={changed}><Radios/></RadioGroup></>);
 const first=document.getElementById('first') as HTMLFormElement;const second=document.getElementById('second') as HTMLFormElement;fireEvent.click(screen.getByLabelText('Gamma'));flush();const cancel=(e:Event)=>e.preventDefault();document.addEventListener('reset',cancel);first.reset();await settle();expect(screen.getByLabelText('Gamma')).toBeChecked();document.removeEventListener('reset',cancel);first.reset();setOwner('second');flush();await settle();expect(screen.getByLabelText('Gamma')).toBeChecked();first.reset();await settle();expect(screen.getByLabelText('Gamma')).toBeChecked();second.reset();await settle();expect(screen.getByLabelText('Alpha')).toBeChecked();fireEvent.click(screen.getByLabelText('Gamma'));flush();second.reset();unmount();await settle();expect(changed.mock.calls.map(call=>call[0])).toEqual(['c','a','c']);
});
it('preserves radio readonly, canceled handlers, required semantics and reactive refs',()=>{
 const ref=vi.fn();const changed=vi.fn();const [disabled,setDisabled]=createSignal(false);render(()=><><RadioGroup readonly required disabled={disabled()} onValueChange={changed}><RadioGroupItem value="x" aria-label="Read only" ref={ref}/></RadioGroup><RadioGroup><RadioGroupItem value="x" aria-label="Canceled" onClick={e=>e.preventDefault()} onFocus={e=>e.preventDefault()} onChange={e=>e.preventDefault()}/></RadioGroup></>);
 const input=screen.getByLabelText('Read only');expect(ref).toHaveBeenCalledWith(input);expect(input).toBeRequired();fireEvent.click(input);flush();expect(input).not.toBeChecked();const canceled=screen.getByLabelText('Canceled') as HTMLInputElement;fireEvent.click(canceled);fireEvent(canceled,new FocusEvent('focus',{cancelable:true}));canceled.checked=true;fireEvent(canceled,new Event('change',{bubbles:true,cancelable:true}));flush();expect(canceled).not.toBeChecked();expect(changed).not.toHaveBeenCalled();setDisabled(true);flush();expect(input).toBeDisabled();
});
it('uses radio arrows, Home/End, looping, vertical and RTL direction while skipping disabled choices',()=>{
 const [orientation,setOrientation]=createSignal<'horizontal'|'vertical'|undefined>();const [loop,setLoop]=createSignal(true);render(()=><RadioGroup orientation={orientation()} loop={loop()} style={{direction:'rtl'}}><Radios/></RadioGroup>);
 const a=screen.getByLabelText('Alpha');const c=screen.getByLabelText('Gamma');a.focus();fireEvent.keyDown(a,{key:'ArrowLeft'});flush();expect(c).toHaveFocus();expect(c).toBeChecked();fireEvent.keyDown(c,{key:'ArrowLeft'});flush();expect(a).toHaveFocus();setLoop(false);setOrientation('vertical');flush();fireEvent.keyDown(a,{key:'ArrowUp'});flush();expect(a).toHaveFocus();fireEvent.keyDown(a,{key:'End'});flush();expect(c).toHaveFocus();fireEvent.keyDown(c,{key:'Home'});flush();expect(a).toHaveFocus();fireEvent.keyDown(a,{key:'ArrowRight'});expect(a).toHaveFocus();setOrientation('horizontal');flush();fireEvent.keyDown(a,{key:'ArrowDown'});expect(a).toHaveFocus();fireEvent.keyDown(a,{key:'ArrowLeft'});flush();expect(c).toHaveFocus();fireEvent.keyDown(c,{key:'ArrowRight'});flush();expect(a).toHaveFocus();
});
it('keeps readonly arrow focus independent from selection and cancels root navigation',()=>{
 render(()=><><RadioGroup readonly defaultValue="a"><Radios/></RadioGroup><RadioGroup onKeyDown={e=>e.preventDefault()}><RadioGroupItem aria-label="Canceled key" value="x"/></RadioGroup></>);const a=screen.getByLabelText('Alpha');const c=screen.getByLabelText('Gamma');a.focus();fireEvent.keyDown(a,{key:'ArrowDown'});flush();expect(c).toHaveFocus();expect(a).toBeChecked();const canceled=screen.getByLabelText('Canceled key');canceled.focus();fireEvent.keyDown(canceled,{key:'Home'});expect(canceled).toHaveFocus();
});
it('toggles single values off and leaves controlled group requests with their owner',()=>{
 const [value,setValue]=createSignal('a');const changed=vi.fn();render(()=><ToggleGroup type="single" value={value()} onValueChange={changed}><ToggleGroupItem value="a">Alpha</ToggleGroupItem><ToggleGroupItem value="c">Gamma</ToggleGroupItem></ToggleGroup>);
 const a=screen.getByRole('button',{name:'Alpha'});const c=screen.getByRole('button',{name:'Gamma'});fireEvent.click(c);flush();expect(changed).toHaveBeenLastCalledWith('c');expect(a).toHaveAttribute('aria-pressed','true');setValue('c');flush();fireEvent.click(c);flush();expect(changed).toHaveBeenLastCalledWith('');expect(c).toHaveAttribute('aria-pressed','true');
});
it('owns single/multiple group selections without mutating initial arrays',()=>{
 const initial=['a'];const change=vi.fn();render(()=><><ToggleGroup type="multiple" defaultValue={initial} onValueChange={change}><ToggleGroupItem value="a">Alpha</ToggleGroupItem><ToggleGroupItem value="c">Gamma</ToggleGroupItem></ToggleGroup><ToggleGroup type="single"><ToggleGroupItem value="x">Single</ToggleGroupItem></ToggleGroup><ToggleGroup type="multiple"><ToggleGroupItem value="z">Empty</ToggleGroupItem></ToggleGroup></>);
 fireEvent.click(screen.getByRole('button',{name:'Gamma'}));flush();expect(change).toHaveBeenLastCalledWith(['a','c']);fireEvent.click(screen.getByRole('button',{name:'Alpha'}));flush();expect(change).toHaveBeenLastCalledWith(['c']);expect(initial).toEqual(['a']);const single=screen.getByRole('button',{name:'Single'});fireEvent.click(single);flush();expect(single).toHaveAttribute('aria-pressed','true');fireEvent.click(single);flush();expect(single).toHaveAttribute('aria-pressed','false');fireEvent.click(screen.getByRole('button',{name:'Empty'}));flush();
});
it('navigates groups without selecting, respects disabled and canceled events, and forwards presentation and refs',()=>{
 const ref=vi.fn();const [disabled,setDisabled]=createSignal(false);render(()=><ToggleGroup type="single" disabled={disabled()} variant="outline" size="sm" spacing={0} style="color: red"><ToggleGroupItem value="a" ref={ref}>Alpha</ToggleGroupItem><ToggleGroupItem value="b" disabled>Beta</ToggleGroupItem><ToggleGroupItem value="c" onClick={e=>e.preventDefault()} onFocus={e=>e.preventDefault()}>Gamma</ToggleGroupItem></ToggleGroup>);
 const a=screen.getByRole('button',{name:'Alpha'});const c=screen.getByRole('button',{name:'Gamma'});expect(ref).toHaveBeenCalledWith(a);expect(a).toHaveAttribute('data-size','sm');a.focus();fireEvent.keyDown(a,{key:'ArrowRight'});flush();expect(c).toHaveFocus();expect(c).toHaveAttribute('aria-pressed','false');fireEvent.click(c);fireEvent(c,new FocusEvent('focus',{cancelable:true}));flush();expect(c).toHaveAttribute('aria-pressed','false');setDisabled(true);flush();expect(a).toBeDisabled();expect(a).toHaveAttribute('tabindex','-1');fireEvent.click(a);fireEvent.keyDown(a,{key:'Home'});flush();expect(a).toHaveAttribute('aria-pressed','false');
});
it('supports ordinary Tab order, item style fallbacks, dynamic removal and nested group isolation',()=>{
 const [roving,setRoving]=createSignal(false);const [shown,setShown]=createSignal(true);render(()=><ToggleGroup type="multiple" rovingFocus={roving()} orientation="vertical" aria-label="Outer"><Show when={shown()}><ToggleGroupItem value="a" size="lg" variant="outline">Alpha</ToggleGroupItem></Show><ToggleGroupItem value="c">Gamma</ToggleGroupItem><ToggleGroup type="single"><ToggleGroupItem value="n">Nested</ToggleGroupItem></ToggleGroup><span data-testid="plain">Plain</span></ToggleGroup>);
 const a=screen.getByRole('button',{name:'Alpha'});const c=screen.getByRole('button',{name:'Gamma'});expect(a).toHaveAttribute('tabindex','0');expect(c).toHaveAttribute('tabindex','0');a.focus();fireEvent.keyDown(a,{key:'ArrowDown'});expect(a).toHaveFocus();setRoving(true);flush();const nested=screen.getByRole('button',{name:'Nested'});nested.focus();fireEvent.keyDown(nested,{key:'ArrowRight'});expect(nested).toHaveFocus();fireEvent.keyDown(screen.getByTestId('plain'),{key:'Home'});fireEvent.keyDown(c,{key:'Escape'});a.focus();setShown(false);flush();expect(c).toHaveAttribute('tabindex','0');expect(c).toHaveAttribute('aria-pressed','false');
});
it('fails clearly for compound items without a root',()=>{
 render(()=><><Errored fallback={e=><p>{String(e())}</p>}><RadioGroupItem value="x"/></Errored><Errored fallback={e=><p>{String(e())}</p>}><ToggleGroupItem value="x"/></Errored></>);expect(screen.getByText(/RadioGroupItem must/)).toBeInTheDocument();expect(screen.getByText(/ToggleGroupItem must/)).toBeInTheDocument();
});

it('preserves data-bound radio focus and native empty disabled attributes, plus default group spacing',()=>{
 const focus=vi.fn();render(()=><><RadioGroup><RadioGroupItem value="a" aria-label="Bound focus" onFocus={[focus,'context']}/><RadioGroupItem value="b" aria-label="Empty disabled radio" disabled=""/></RadioGroup><ToggleGroup type="single" style="color: blue"><ToggleGroupItem value="a" disabled="">Empty disabled item</ToggleGroupItem></ToggleGroup><Toggle disabled="">Empty disabled toggle</Toggle></>);screen.getByLabelText('Bound focus').focus();flush();expect(focus.mock.calls[0]?.[0]).toBe('context');expect(screen.getByLabelText('Empty disabled radio')).toBeDisabled();expect(screen.getByRole('button',{name:'Empty disabled item'})).toBeDisabled();expect(screen.getByRole('button',{name:'Empty disabled toggle'})).toBeDisabled();
});

it('leaves explicitly detached radios outside the enclosing form',()=>{
 render(()=><form data-testid="detached"><RadioGroup name="choice" form="" defaultValue="a"><RadioGroupItem value="a" aria-label="Detached"/></RadioGroup></form>);expect((screen.getByLabelText('Detached') as HTMLInputElement).form).toBeNull();expect(new FormData(screen.getByTestId('detached') as HTMLFormElement).has('choice')).toBe(false);
});

it('supports focus assigned by an owning effect without leaking reactive reads into that effect',()=>{
 const [ready,setReady]=createSignal(false);const [value]=createSignal('a');let radio!:HTMLInputElement;let button!:HTMLButtonElement;
 render(()=>{createEffect(()=>ready(),active=>{if(active){radio.focus();button.focus();}});return <><RadioGroup><RadioGroupItem value={value()} ref={node=>{radio=node;}} aria-label="Effect radio"/></RadioGroup><ToggleGroup type="single"><ToggleGroupItem value={value()} ref={node=>{button=node;}}>Effect button</ToggleGroupItem></ToggleGroup></>;});setReady(true);flush();expect(button).toHaveFocus();
});
