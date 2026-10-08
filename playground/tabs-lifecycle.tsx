// Public-export fixtures for dynamic tab order, removal and panel lifetime; D19/D90.
import { createSignal, For } from 'solid-js';
import { Tabs, TabsList, TabsTrigger, TabsContent } from 'shadcn-solidjs-theme/ui/tabs';
import { Button } from 'shadcn-solidjs-theme/ui/button';
import { Input } from 'shadcn-solidjs-theme/ui/input';
import { Label } from 'shadcn-solidjs-theme/ui/label';
const initial = [
  { value: 'overview', label: 'Overview', disabled: false },
  { value: 'locked', label: 'Locked', disabled: true },
  { value: 'activity', label: 'Activity', disabled: false },
  { value: 'settings', label: 'Settings', disabled: false },
];

/** Let the example owner change its keyed collection without manually repairing focus. */
export function TabsLifecycle() {
  const manual = new URLSearchParams(location.search).has('manual');
  const [items, setItems] = createSignal(initial);
  /** Delete removes a tab; Alt+End moves it last while its button still owns focus. */
  function changeTabs(event: KeyboardEvent & { target: Element }) {
    const value = event.target.closest('[role="tab"]')?.getAttribute('data-value');
    if (!value) return;
    if (event.key === 'Delete') {
      event.preventDefault();
      setItems(items().filter(item => item.value !== value));
    } else if (event.altKey && event.key === 'End') {
      event.preventDefault();
      setItems([...items().filter(item => item.value !== value), ...items().filter(item => item.value === value)]);
    }
  }
  return <main>
    <h1>Tabs lifecycle</h1>
    <p>Delete removes the focused tab. Alt+End moves it to the end. This preview uses {manual ? 'manual' : 'automatic'} activation.</p>
    <div class="samples my-6">
      <Button onClick={() => setItems(items().filter(item => item.value !== 'activity'))}>Remove Activity externally</Button>
      <Button onClick={() => setItems([...items()].reverse())}>Reverse tabs externally</Button>
    </div>
    <Tabs defaultValue="overview" activationMode={manual ? 'manual' : 'automatic'}>
      <TabsList aria-label="Dynamic sections" onKeyDown={changeTabs}>
        <For each={items()}>{item => <TabsTrigger value={item.value} data-value={item.value} disabled={item.disabled}>{item.label}</TabsTrigger>}</For>
      </TabsList>
      <TabsContent value="overview"><p>Overview panel</p></TabsContent>
      <TabsContent value="activity" forceMount><Label for="persistent-draft">Persistent draft</Label><Input id="persistent-draft" defaultValue="Original persistent draft"/></TabsContent>
      <TabsContent value="settings"><Label for="lazy-draft">Lazy draft</Label><Input id="lazy-draft" defaultValue="Original lazy draft"/></TabsContent>
    </Tabs>
    <Button class="mt-6">After tabs</Button>
  </main>;
}
