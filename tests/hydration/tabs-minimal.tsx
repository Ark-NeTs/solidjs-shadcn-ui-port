// Two-tab/one-input differential reproduction for source Tabs versus bare Solid; D19/D90.
import { createContext, createSignal, onCleanup, omit, Show, untrack, useContext } from 'solid-js';
import { isServer, type JSX } from '@solidjs/web';
import { Tabs, TabsList, TabsTrigger, TabsContent } from 'shadcn-solidjs-theme/ui/tabs';
export const probeModes = ['plain', 'context', 'registration', 'registration-spread', 'registration-read', 'package-shell', 'package-triggers', 'package-panels', 'package-controlled', 'package-uncontrolled'] as const;
export type ProbeMode = typeof probeModes[number];
type State = { spread: boolean; selected: () => string; select: (value: string) => void; register: (value: string) => void };
const Context = createContext<State>();
/** Use only Solid state/context and optional synchronous part registration. */
function PlainRoot(props: { registration: boolean; spread?: boolean; readSnapshot?: boolean; children: JSX.Element }) {
  const [selected, select] = createSignal('one');
  const [entries, setEntries] = createSignal<string[]>([], { ownedWrite: true });
  const serverEntries: string[] = [];
  /** Record child order without writing reactive state in an SSR render. */
  function register(value: string) {
    if (!props.registration) return;
    if (isServer) { serverEntries.push(value);return; }
    if (props.readSnapshot) setEntries([...untrack(entries), value]);
    else setEntries(current => [...current, value]);
    onCleanup(() => setEntries(current => current.filter(entry => entry !== value)));
  }
  const value = () => {
    if (!props.registration) return selected();
    const values = isServer ? serverEntries : entries();
    return values.includes(selected()) ? selected() : values[0];
  };
  return <Context value={{ spread: Boolean(props.spread), selected: () => value() ?? 'one', select, register }}><div>{props.children}</div></Context>;
}
/** Render one ordinary native button; registration is the only optional behavior. */
function PlainTrigger(props: { value: string; children: JSX.Element }) {
  const context = useContext(Context)!;
  context.register(props.value);
  if (context.spread) return <button {...omit(props, 'value')} role="tab" aria-selected={context.selected() === props.value ? 'true' : 'false'} onClick={() => context.select(props.value)}/>;
  return <button role="tab" aria-selected={context.selected() === props.value ? 'true' : 'false'} onClick={() => context.select(props.value)}>{props.children}</button>;
}
/** Preserve the one input while selection switches between native panels. */
function PlainPanel(props: { value: string; children: JSX.Element }) {
  const context = useContext(Context)!;
  if (context.spread) return <div {...omit(props, 'value', 'children')} role="tabpanel" hidden={context.selected() !== props.value}><Show when={true}>{props.children}</Show></div>;
  return <div role="tabpanel" hidden={context.selected() !== props.value}><Show when={true}>{props.children}</Show></div>;
}
/** Keep exactly two tabs and one input in every comparison variant. */
export function MinimalTabs(props: { mode: ProbeMode }) {
  const [selected, select] = createSignal('one');
  const mode = untrack(() => props.mode);
  if (mode === 'plain') return <div><div role="tablist"><button role="tab" aria-selected={selected() === 'one' ? 'true' : 'false'} onClick={() => select('one')}>Profile</button><button role="tab" aria-selected={selected() === 'two' ? 'true' : 'false'} onClick={() => select('two')}>History</button></div><div role="tabpanel" hidden={selected() !== 'one'}><input aria-label="Draft" value="Server draft"/></div><div role="tabpanel" hidden={selected() !== 'two'}>History content</div></div>;
  if (mode === 'context' || mode === 'registration' || mode === 'registration-spread' || mode === 'registration-read') return <PlainRoot registration={mode !== 'context'} spread={mode === 'registration-spread'} readSnapshot={mode === 'registration-read'}><div role="tablist"><PlainTrigger value="one">Profile</PlainTrigger><PlainTrigger value="two">History</PlainTrigger></div><PlainPanel value="one"><input aria-label="Draft" value="Server draft"/></PlainPanel><PlainPanel value="two">History content</PlainPanel></PlainRoot>;
  if (mode === 'package-shell') return <Tabs><div role="tablist"><button role="tab" aria-selected={selected() === 'one' ? 'true' : 'false'} onClick={() => select('one')}>Profile</button><button role="tab" aria-selected={selected() === 'two' ? 'true' : 'false'} onClick={() => select('two')}>History</button></div><div role="tabpanel" hidden={selected() !== 'one'}><input aria-label="Draft" value="Server draft"/></div><div role="tabpanel" hidden={selected() !== 'two'}>History content</div></Tabs>;
  if (mode === 'package-triggers') return <Tabs value={selected()} onValueChange={select}><TabsList><TabsTrigger value="one">Profile</TabsTrigger><TabsTrigger value="two">History</TabsTrigger></TabsList><div role="tabpanel" hidden={selected() !== 'one'}><input aria-label="Draft" value="Server draft"/></div><div role="tabpanel" hidden={selected() !== 'two'}>History content</div></Tabs>;
  if (mode === 'package-panels') return <Tabs value={selected()}><div role="tablist"><button role="tab" aria-selected={selected() === 'one' ? 'true' : 'false'} onClick={() => select('one')}>Profile</button><button role="tab" aria-selected={selected() === 'two' ? 'true' : 'false'} onClick={() => select('two')}>History</button></div><TabsContent value="one" forceMount><input aria-label="Draft" value="Server draft"/></TabsContent><TabsContent value="two">History content</TabsContent></Tabs>;
  return <Tabs value={mode === 'package-controlled'  ? selected() : undefined} defaultValue="one" onValueChange={select}><TabsList><TabsTrigger value="one">Profile</TabsTrigger><TabsTrigger value="two">History</TabsTrigger></TabsList><TabsContent value="one" forceMount><input aria-label="Draft" value="Server draft"/></TabsContent><TabsContent value="two">History content</TabsContent></Tabs>;
}
