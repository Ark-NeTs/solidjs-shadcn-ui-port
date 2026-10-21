// Application-owned Query cache, HTTP persistence and draft state around public UI exports.
import {createMemo, createSignal, createStore, Loading, onCleanup, onSettled, Show, untrack} from 'solid-js';
import {useQuery, useQueryClient} from '@tanstack/solid-query';
import {Button} from 'shadcn-solidjs-theme/ui/button';
import {DataTable, type ColumnDef} from 'shadcn-solidjs-theme/ui/data-table';
import {Dialog, DialogContent, DialogTitle, DialogDescription} from 'shadcn-solidjs-theme/ui/dialog';
import {Input} from 'shadcn-solidjs-theme/ui/input';
import {Label} from 'shadcn-solidjs-theme/ui/label';
import {readItems, saveItem, type WorkflowItem} from './workflow-api';

function Editor() {
 const session = new URLSearchParams(location.search).get('session') ?? '';
 const client = useQueryClient();
 const key = ['workflow', session];
 const uncertainKey = ['workflow-uncertain', session];
 const unknownMessage = 'Save outcome is unknown. Your draft is preserved. Reload before saving again.';
 const query = useQuery(() => ({queryKey: key, queryFn: ({signal}) => readItems(session, signal), staleTime: Infinity, retry: false}));
 // Query reconciles stable store proxies; Table core caches accessor values by row identity.
 // Snapshot the tracked fields at this application adapter boundary so edits invalidate that cache.
 const rows = createMemo(() => query.data.map(item => ({...item})));
 const [open, setOpen] = createSignal(false), [saving, setSaving] = createSignal(false);
 const [error, setError] = createSignal(''), [uncertain, setUncertain] = createSignal(false), [notice, setNotice] = createSignal('');
 const [draft, setDraft] = createStore({name: '', price: ''});
 let selected: WorkflowItem | undefined, request: AbortController | undefined, alive = true;
 let container: HTMLDivElement | undefined, input: HTMLInputElement | undefined;
 onCleanup(() => {alive = false; request?.abort();});
 function edit(item: WorkflowItem) {
  selected = {...item}; setDraft(current => {current.name = item.name; current.price = (item.priceCents / 100).toFixed(2);});
  const blocked = client.getQueryData<string[]>(uncertainKey)?.includes(item.id) ?? false;
  setError(blocked ? unknownMessage : ''); setUncertain(blocked); setOpen(true);
 }
 async function submit(event: SubmitEvent) {
  event.preventDefault();
  if (request || !selected || uncertain()) return;
  if (!draft.name.trim() || !/^\d{1,5}(\.\d{1,2})?$/.test(draft.price) || Number(draft.price) <= 0) {
   setError('Enter an item name and a positive price with at most two decimals.'); input?.focus(); return;
  }
  const write = new AbortController(); request = write; setSaving(true); setError('');
  try {
   const result = await saveItem(session, {...selected, name: draft.name, priceCents: Math.round(Number(draft.price) * 100)}, write.signal);
   if (!alive) return;
   if (!result.accepted) {setError(result.message); return;}
   client.setQueryData<WorkflowItem[]>(key, rows => rows?.map(row => row.id === result.item.id ? result.item : row));
   setNotice(`Saved ${result.item.name}.`); setOpen(false);
  } catch {
   if (alive) {
    client.setQueryData<string[]>(uncertainKey, ids => [...new Set([...(ids ?? []), selected!.id])]);
    setUncertain(true); setError(unknownMessage);
   }
  } finally {
   if (alive) {request = undefined; setSaving(false);}
  }
 }
 const columns: ColumnDef<WorkflowItem, unknown>[] = [
  {accessorKey: 'name', header: 'Menu item'},
  {accessorKey: 'priceCents', header: 'Price', cell: cell => <span>${(cell.getValue<number>() / 100).toFixed(2)}</span>},
  {id: 'actions', header: 'Actions', cell: cell => <Button data-workflow-edit={cell.row.original.id} aria-label={`Edit ${cell.row.original.name}`} onClick={() => edit(cell.row.original)}>Edit</Button>},
 ];
 return <section aria-label="HTTP menu workflow" class="grid min-w-0 gap-4">
  <h2>HTTP menu workflow</h2><p role="status">{notice()}</p>
  <div ref={container}><DataTable data={rows()} columns={columns} getRowId={row => row.id} selectable caption="Persisted menu items"/></div>
  <Dialog open={open()} dismissible={!saving()} onOpenChange={value => {if (!request) setOpen(value);}}>
   <DialogContent showCloseButton={false} onOpenAutoFocus={event => {event.preventDefault(); input?.focus();}}
    onCloseAutoFocus={event => {event.preventDefault(); const id = selected?.id; onSettled(() => {if (!alive || !id) return; (container?.querySelector<HTMLButtonElement>(`[data-workflow-edit="${CSS.escape(id)}"]`) ?? container?.querySelector<HTMLInputElement>('input'))?.focus();});}}>
    <DialogTitle>Edit persisted menu item</DialogTitle><DialogDescription>The table changes only after the HTTP server accepts your save.</DialogDescription>
    <form id="workflow-editor" novalidate onSubmit={submit} class="grid gap-4" aria-busy={saving() ? 'true' : undefined}>
     <fieldset disabled={saving()} class="grid gap-3"><legend class="sr-only">Item details</legend>
      <Label for="workflow-name">Item name</Label><Input ref={input} id="workflow-name" required value={draft.name} onInput={event => setDraft(current => {current.name = event.currentTarget.value;})}/>
      <Label for="workflow-price">Price (USD)</Label><Input id="workflow-price" inputmode="decimal" required value={draft.price} onInput={event => setDraft(current => {current.price = event.currentTarget.value;})}/>
     </fieldset>
     <Show when={error()}><p role="alert" class="text-destructive-emphasis">{error()}</p></Show>
     <div class="flex flex-wrap gap-2"><Button variant="outline" disabled={saving()} onClick={() => setOpen(false)}>Cancel</Button><Button type="submit" disabled={saving() || uncertain()}>{saving() ? 'Saving…' : 'Save changes'}</Button></div>
    </form>
   </DialogContent>
  </Dialog>
 </section>;
}

export function Workflow() {
 const dark = untrack(() => new URLSearchParams(location.search).has('dark'));
 return <div class={dark ? 'dark bg-background text-foreground p-4' : 'bg-background text-foreground p-4'}><Loading fallback={<p role="status">Loading persisted menu…</p>}><Editor/></Loading></div>;
}
