// Selection ownership, dynamic registration, lazy panels and event contracts; D19/D90.
import { it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@solidjs/testing-library';
import { createSignal, flush, Show, Errored } from 'solid-js';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../src';
it('derives an enabled default and wires reactive IDs, selection, refs and lazy panels',()=>{
 const [id,setId]=createSignal('first');const [visible,setVisible]=createSignal(true);let ref:HTMLButtonElement|undefined;
 render(()=><Tabs id={id()}><TabsList aria-label="Options"><TabsTrigger value="disabled" disabled>Disabled</TabsTrigger><TabsTrigger value="one" ref={node=>{ref=node;}}>One</TabsTrigger><Show when={visible()}><TabsTrigger value="two" id={`${id()}-custom`}>Two</TabsTrigger></Show></TabsList><TabsContent value="one">First child</TabsContent><Show when={visible()}><TabsContent value="two" id={`${id()}-panel`}>Second child</TabsContent></Show></Tabs>);
 expect(ref).toBe(screen.getByRole('tab',{name:'One'}));expect(ref).toHaveAttribute('aria-selected','true');expect(screen.queryByText('Second child')).toBeNull();fireEvent.click(screen.getByRole('tab',{name:'Two'}));flush();expect(screen.getByText('Second child')).toBeVisible();expect(screen.queryByText('First child')).toBeNull();setId('changed');flush();expect(screen.getByRole('tab',{name:'Two'})).toHaveAttribute('aria-controls','changed-panel');expect(screen.getByRole('tabpanel')).toHaveAttribute('aria-labelledby','changed-custom');setVisible(false);flush();expect(ref).toHaveAttribute('aria-selected','true');expect(ref).toHaveAttribute('tabindex','0');
});
it('honors controlled selection, manual activation, callbacks and forceMount',()=>{
 const [value,setValue]=createSignal('one');const change=vi.fn();const click=vi.fn();const focus=vi.fn();render(()=><Tabs value={value()} onValueChange={change} activationMode="manual"><TabsList variant="line"><TabsTrigger value="one">One</TabsTrigger><TabsTrigger value="two" onClick={[click,'clicked']} onFocus={[focus,'focused']}>Two</TabsTrigger></TabsList><TabsContent value="one">First</TabsContent><TabsContent value="two" forceMount>Second</TabsContent></Tabs>);
 const two=screen.getByRole('tab',{name:'Two'});two.focus();flush();expect(change).not.toHaveBeenCalled();expect(two).toHaveAttribute('tabindex','0');expect(focus.mock.calls[0]?.[0]).toBe('focused');fireEvent.click(two);flush();expect(change).toHaveBeenCalledExactlyOnceWith('two');expect(two).toHaveAttribute('aria-selected','false');expect(click.mock.calls[0]?.[0]).toBe('clicked');expect(screen.getByText('Second')).not.toBeVisible();setValue('two');flush();expect(screen.getByText('Second')).toBeVisible();fireEvent.click(two);expect(change).toHaveBeenCalledTimes(1);
});
it('cancels consumer events and handles looping, endpoints, direction and orientation',()=>{
 const [orientation,setOrientation]=createSignal<'horizontal'|'vertical'>('horizontal');const [loop,setLoop]=createSignal(false);const [cancel,setCancel]=createSignal(false);const [rtl,setRtl]=createSignal(false);
 render(()=><Tabs defaultValue="one" orientation={orientation()}><TabsList data-testid="list" loop={loop()} style={{direction:rtl()?'rtl':'ltr'}} onKeyDown={event=>{if(cancel())event.preventDefault();}}><span>Not a tab</span><TabsTrigger value="one">One</TabsTrigger><TabsTrigger value="off" disabled>Off</TabsTrigger><TabsTrigger value="two" onClick={event=>event.preventDefault()} onFocus={event=>{if(cancel())event.preventDefault();}}>Two</TabsTrigger></TabsList><TabsContent value="one">First</TabsContent><TabsContent value="two">Second</TabsContent></Tabs>);
 const one=screen.getByRole('tab',{name:'One'});const two=screen.getByRole('tab',{name:'Two'});one.focus();fireEvent.keyDown(one,{key:'ArrowLeft'});flush();expect(one).toHaveFocus();fireEvent.keyDown(one,{key:'End'});flush();expect(two).toHaveFocus();expect(two).toHaveAttribute('aria-selected','true');fireEvent.keyDown(two,{key:'Home'});flush();expect(one).toHaveFocus();fireEvent.click(two);flush();expect(one).toHaveAttribute('aria-selected','true');setLoop(true);flush();fireEvent.keyDown(one,{key:'ArrowLeft'});flush();expect(two).toHaveFocus();fireEvent.keyDown(two,{key:'ArrowRight'});flush();expect(one).toHaveFocus();setRtl(true);flush();fireEvent.keyDown(one,{key:'ArrowLeft'});flush();expect(two).toHaveFocus();fireEvent.keyDown(two,{key:'ArrowRight'});flush();expect(one).toHaveFocus();setOrientation('vertical');flush();fireEvent.keyDown(one,{key:'ArrowDown'});flush();expect(two).toHaveFocus();fireEvent.keyDown(two,{key:'ArrowUp'});flush();expect(one).toHaveFocus();fireEvent.keyDown(one,{key:'Enter'});flush();fireEvent.keyDown(screen.getByText('Not a tab'),{key:'ArrowDown'});flush();setCancel(true);flush();fireEvent.keyDown(one,{key:'ArrowDown'});flush();expect(one).toHaveFocus();fireEvent(two,new FocusEvent('focusin',{bubbles:true,cancelable:true}));flush();expect(one).toHaveAttribute('aria-selected','true');
});
it('provides a tab stop for invalid controlled values and no selection with every tab disabled',()=>{
 render(()=><><Tabs value="missing"><TabsList><TabsTrigger value="one">Available</TabsTrigger></TabsList></Tabs><Tabs><TabsList><TabsTrigger value="off" disabled>Only disabled</TabsTrigger></TabsList></Tabs></>);expect(screen.getByRole('tab',{name:'Available'})).toHaveAttribute('tabindex','0');expect(screen.getByRole('tab',{name:'Only disabled'})).toHaveAttribute('aria-selected','false');
});
it('rejects parts outside a root',()=>{render(()=><Errored fallback={error=><p>{(error() as Error).message}</p>}><TabsList/></Errored>);expect(screen.getByText('Tabs parts must be inside Tabs.')).toBeVisible();});

for(const manual of [false,true])it(`recovers removed trigger focus after registration settles in ${manual?'manual':'automatic'} mode`,async()=>{
 const [visible,setVisible]=createSignal(true);
 render(()=><Tabs defaultValue="one" activationMode={manual?'manual':'automatic'}><TabsList aria-label="Removal"><TabsTrigger value="one">Remain</TabsTrigger><TabsTrigger value="off" disabled>Skip</TabsTrigger><Show when={visible()}><TabsTrigger value="two">Remove focused</TabsTrigger></Show></TabsList><TabsContent value="one">First panel</TabsContent><TabsContent value="two">Second panel</TabsContent></Tabs>);
 screen.getByText('Remove focused').focus();flush();setVisible(false);flush();await Promise.resolve();flush();
 expect(screen.getByText('Remain')).toHaveFocus();expect(screen.getByText('Remain')).toHaveAttribute('aria-selected','true');expect(screen.getByText('Remain')).toHaveAttribute('tabindex','0');
});
it('keeps the empty enabled collection focused on its list and honors an explicit list tab stop',async()=>{
 const [visible,setVisible]=createSignal(true);
 render(()=><Tabs><TabsList aria-label="Empty fallback" tabindex={0}><TabsTrigger value="off" disabled>Disabled survivor</TabsTrigger><Show when={visible()}><TabsTrigger value="only">Last enabled</TabsTrigger></Show></TabsList></Tabs>);
 const list=screen.getByRole('tablist');expect(list).toHaveAttribute('tabindex','0');screen.getByText('Last enabled').focus();flush();setVisible(false);flush();await Promise.resolve();expect(list).toHaveFocus();
});
it('does not replace a newer focus destination while removal recovery is queued',async()=>{
 const [visible,setVisible]=createSignal(true);
 render(()=><><button>Outside destination</button><Tabs><TabsList><TabsTrigger value="one">Remaining choice</TabsTrigger><Show when={visible()}><TabsTrigger value="two">Departing choice</TabsTrigger></Show></TabsList></Tabs></>);
 screen.getByText('Departing choice').focus();flush();setVisible(false);flush();screen.getByText('Outside destination').focus();await Promise.resolve();expect(screen.getByText('Outside destination')).toHaveFocus();
});
it('disconnects recovery when the complete root unmounts and safely disposes a trigger without a list',async()=>{
 const first=render(()=><Tabs><TabsList><TabsTrigger value="one">Unmount root</TabsTrigger></TabsList></Tabs>);
 screen.getByText('Unmount root').focus();flush();first.unmount();await Promise.resolve();expect(document.activeElement).toBe(document.body);
 const [visible,setVisible]=createSignal(true);render(()=><Tabs><Show when={visible()}><TabsTrigger value="one">No list</TabsTrigger></Show></Tabs>);
 screen.getByText('No list').focus();flush();setVisible(false);flush();await Promise.resolve();expect(document.activeElement).toBe(document.body);
});

it('restores a moved node without changing manual selection and ignores unrelated DOM mutations',async()=>{
 let ref:HTMLDivElement|undefined;
 render(()=><Tabs defaultValue="two" activationMode="manual"><TabsList aria-label="Reorder" ref={node=>{ref=node;}}><TabsTrigger value="one">Moving node</TabsTrigger><TabsTrigger value="two">Selected node</TabsTrigger></TabsList></Tabs>);
 const list=screen.getByRole('tablist');expect(ref).toBe(list);const moving=screen.getByText('Moving node');
 moving.focus();flush();moving.blur();list.append(document.createElement('span'));await Promise.resolve();expect(document.activeElement).toBe(document.body);
 moving.focus();flush();list.append(moving);await Promise.resolve();expect(moving).toHaveFocus();expect(screen.getByText('Selected node')).toHaveAttribute('aria-selected','true');
 // A detached list cannot reclaim page focus even when child mutations are still queued.
 list.remove();list.append(moving);await Promise.resolve();expect(document.activeElement).toBe(document.body);
});
