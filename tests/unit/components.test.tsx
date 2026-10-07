// Prove public component behavior and Solid 2 updates under a real owner; D19.
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@solidjs/testing-library';
import { createSignal, createMemo, Loading, flush } from 'solid-js';
import { Button } from '../../src/components/ui/button';
import { Badge, badgeVariants } from '../../src/components/ui/badge';
import { Card, CardHeader, CardTitle, CardDescription, CardAction, CardContent, CardFooter } from '../../src/components/ui/card';
import { Separator } from '../../src/components/ui/separator';
import { Skeleton } from '../../src/components/ui/skeleton';

describe('Button', () => {
  it('preserves native attributes, refs, default type and click handlers', () => {
    const click=vi.fn();let ref: HTMLButtonElement | undefined;
    render(() => <Button ref={element => {ref=element;}} name="action" value="save" onClick={click} class="h-12">Save</Button>);
    const button=screen.getByRole('button',{name:'Save'});
    expect(ref).toBe(button);expect(button).toHaveAttribute('type','button');expect(button).toHaveAttribute('name','action');expect(button).toHaveAttribute('value','save');expect(button).toHaveClass('h-12');expect(button).not.toHaveClass('h-8');
    fireEvent.click(button);expect(click).toHaveBeenCalledTimes(1);
  });
  it('updates variants, size, children and disabled state without replacing its node', () => {
    const [disabled,setDisabled]=createSignal(false);const [changed,setChanged]=createSignal(false);
    render(() => <Button disabled={disabled()} variant={changed()?'outline':'default'} size={changed()?'lg':'sm'}>{changed()?'Updated':'Save'}</Button>);
    const button=screen.getByRole('button');setDisabled(true);setChanged(true);flush();
    expect(button).toBeDisabled();expect(button).toHaveTextContent('Updated');expect(button).toHaveAttribute('data-variant','outline');expect(button).toHaveAttribute('data-size','lg');expect(button).toHaveClass('border-border','h-9');expect(screen.getByRole('button')).toBe(button);
  });
  it('supports native submit and reset types and aria state', () => {
    render(() => <><Button type="submit" aria-invalid="true">Submit</Button><Button type="reset">Reset</Button></>);
    expect(screen.getByRole('button',{name:'Submit'})).toHaveAttribute('type','submit');expect(screen.getByRole('button',{name:'Submit'})).toHaveAttribute('aria-invalid','true');expect(screen.getByRole('button',{name:'Reset'})).toHaveAttribute('type','reset');
  });
  it('supports data-bound handlers and a disabled link cannot invoke them or navigate', () => {
    const click=vi.fn();const [disabled,setDisabled]=createSignal(false);
    render(() => <Button as="a" href="#destination" disabled={disabled()} tabindex={2} onClick={[click,'bound']}>Continue</Button>);
    const link=screen.getByRole('link');expect(link).toHaveAttribute('href','#destination');expect(link).toHaveAttribute('tabindex','2');fireEvent.click(link);expect(click.mock.calls[0]?.[0]).toBe('bound');
    setDisabled(true);flush();expect(link).not.toHaveAttribute('href');expect(link).toHaveAttribute('aria-disabled','true');expect(link).toHaveAttribute('tabindex','-1');expect(fireEvent.click(link)).toBe(false);expect(click).toHaveBeenCalledTimes(1);
    setDisabled(false);flush();expect(link).toHaveAttribute('href','#destination');expect(link).not.toHaveAttribute('aria-disabled');
  });
  it('allows a link without a handler and preserves explicit aria-disabled', () => {
    render(() => <Button as="a" href="#details" aria-disabled="false">Details</Button>);fireEvent.click(screen.getByRole('link'));expect(screen.getByRole('link')).toHaveAttribute('aria-disabled','false');
  });
  it.each(['default','outline','secondary','ghost','link','destructive'] as const)('renders %s variants', variant => {
    render(() => <Button variant={variant} size="icon" aria-label="Action">+</Button>);expect(screen.getByRole('button',{name:'Action'})).toHaveAttribute('data-variant',variant);expect(screen.getByRole('button',{name:'Action'})).toHaveClass('size-8');
  });
});

describe('Badge and Card', () => {
  it('updates a badge variant and supports links with caller classes', () => {
    const [variant,setVariant]=createSignal<'default'|'outline'>('default');
    render(() => <><Badge variant={variant()} class="h-8">Ready</Badge><Badge as="a" href="#docs">Docs</Badge></>);
    expect(screen.getByText('Ready')).toHaveClass('h-8');expect(screen.getByRole('link',{name:'Docs'})).toHaveAttribute('href','#docs');setVariant('outline');flush();expect(screen.getByText('Ready')).toHaveAttribute('data-variant','outline');expect(badgeVariants({variant:'outline'})).toContain('border-border');
  });
  it('uses the default badge variant', () => {render(() => <Badge>Default</Badge>);expect(screen.getByText('Default')).toHaveAttribute('data-variant','default');});
  it('composes every card slot and preserves reactive size, native props and children', () => {
    const [size,setSize]=createSignal<'default'|'sm'|undefined>(undefined);
    render(() => <Card size={size()} id="card" class="rounded-none"><CardHeader><CardTitle><h2>Title</h2></CardTitle><CardDescription>Description</CardDescription><CardAction>Action</CardAction></CardHeader><CardContent>Content</CardContent><CardFooter>Footer</CardFooter></Card>);
    expect(screen.getByRole('heading',{name:'Title'})).toBeVisible();const card=document.getElementById('card')!;expect(card).toHaveClass('rounded-none');expect(card).not.toHaveClass('rounded-xl');expect(card).toHaveAttribute('data-size','default');setSize('sm');flush();expect(card).toHaveAttribute('data-size','sm');
    for(const slot of ['header','title','description','action','content','footer'])expect(card.querySelector(`[data-slot="card-${slot}"]`)).not.toBeNull();
  });
});

describe('Separator and Skeleton', () => {
  it('switches orientation and decorative semantics reactively', () => {
    const [decorative,setDecorative]=createSignal<boolean|undefined>(undefined);const [orientation,setOrientation]=createSignal<'horizontal'|'vertical'|undefined>(undefined);
    const {container}=render(() => <Separator decorative={decorative()} orientation={orientation()} class="my-4" />);const line=container.firstElementChild!;
    expect(line).toHaveAttribute('aria-hidden','true');expect(line).toHaveAttribute('data-horizontal','');expect(screen.queryByRole('separator')).toBeNull();setDecorative(false);flush();expect(screen.getByRole('separator')).toHaveAttribute('aria-orientation','horizontal');
    setOrientation('vertical');flush();expect(line).toHaveAttribute('aria-orientation','vertical');expect(line).toHaveAttribute('data-vertical','');expect(line).not.toHaveAttribute('data-horizontal');setDecorative(true);flush();expect(line).not.toHaveAttribute('aria-orientation');
  });
  it('forwards placeholder attributes while hiding decorative content', () => {
    render(() => <Skeleton data-testid="loading" class="h-6 rounded-none" />);expect(screen.getByTestId('loading')).toHaveClass('h-6','rounded-none','bg-muted');expect(screen.getByTestId('loading')).toHaveAttribute('aria-hidden','true');
  });
  it('works as a Solid 2 Loading fallback and releases it when content resolves', async () => {
    let resolve!: (value:string)=>void;const pending=new Promise<string>(done=>{resolve=done;});
    /** Read asynchronous data only within the loading boundary. */
    function AsyncContent(){const value=createMemo(()=>pending);return <p>{value()}</p>;}
    render(() => <Loading fallback={<Skeleton data-testid="fallback" class="h-10" />}><AsyncContent /></Loading>);
    expect(screen.getByTestId('fallback')).toBeInTheDocument();resolve('Ready content');await waitFor(()=>expect(screen.getByText('Ready content')).toBeInTheDocument());expect(screen.queryByTestId('fallback')).toBeNull();
  });
});
