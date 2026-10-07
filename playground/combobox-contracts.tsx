// Focused browser examples for canonical Combobox forms and controlled ownership; D19/D90.
import { createSignal } from 'solid-js';
import type { JSX } from '@solidjs/web';
import { Button } from 'shadcn-solidjs-theme/ui/button';
import { Label } from 'shadcn-solidjs-theme/ui/label';
import { Combobox, ComboboxInput, ComboboxContent, ComboboxList, ComboboxItem, ComboboxEmpty, ComboboxValue, ComboboxChips, ComboboxChip, ComboboxChipsInput, ComboboxClear } from 'shadcn-solidjs-theme/ui/combobox';
const fruits = ['Apple', 'Banana', 'Cherry'];
type Place = { id: string; label: string };

/** Expose local examples without changing the main gallery's visual baselines. */
export function ComboboxContracts() {
  return <main class="space-y-8 bg-background text-foreground">
    <h1>Combobox form and ownership examples</h1>
    <MultipleForm controlled={false}/><MultipleForm controlled/>
    <ObjectForm/><ControlledForm/>
  </main>;
}

/** Submit real repeated form entries; let Combobox request its own reset defaults. */
function MultipleForm(props: { controlled: boolean }) {
  const mode = props.controlled ? 'Controlled' : 'Uncontrolled';
  const [selection, setSelection] = createSignal<string[]>(['Apple']);
  const [submitted, setSubmitted] = createSignal('Not submitted');
  /** Preserve every successful value, including an empty selection. */
  function submit(event: SubmitEvent & { currentTarget: HTMLFormElement }) {
    event.preventDefault();
    setSubmitted(JSON.stringify(new FormData(event.currentTarget).getAll('fruits')));
  }
  return <form aria-label={`${mode} collection`} class="space-y-3" onSubmit={submit}>
    <Label for={`${mode}-fruits`}>{mode} fruit collection</Label>
    <Combobox<string> items={fruits} multiple defaultValue={['Apple']} value={props.controlled ? selection() : undefined} onValueChange={setSelection} name="fruits">
      <ComboboxChips><ComboboxValue<string>>{value => (value as readonly string[]).map(item => <ComboboxChip value={item}/>)}</ComboboxValue><ComboboxChipsInput id={`${mode}-fruits`}/></ComboboxChips>
      <ComboboxClear aria-label="Clear collection"/>
      <ComboboxContent><ComboboxList>{(item: string) => <ComboboxItem value={item}>{item}</ComboboxItem>}</ComboboxList><ComboboxEmpty>No matching fruit.</ComboboxEmpty></ComboboxContent>
    </Combobox>
    <Button type="submit">Submit collection</Button><Button type="reset" variant="outline">Reset collection</Button>
    <output aria-label="Submitted collection">{submitted()}</output>
  </form>;
}

/** Replace object instances/results while preserving the independently owned selection. */
function ObjectForm() {
  const initial: Place = { id: 'north', label: 'North studio' };
  const [results, setResults] = createSignal<Place[]>([initial, { id: 'south', label: 'South studio' }]);
  const [submitted, setSubmitted] = createSignal('Not submitted');
  /** Replace both records with fresh identities while retaining their stable keys. */
  function replaceResults() {
    setResults([{ id: 'north', label: 'North studio refreshed' }, { id: 'south', label: 'South studio refreshed' }]);
  }
  /** Render an empty result set without clearing the canonical selection. */
  function emptyResults() { setResults([]); }
  /** Submit the stable key instead of the displayed object label. */
  function submit(event: SubmitEvent & { currentTarget: HTMLFormElement }) {
    event.preventDefault();
    setSubmitted(JSON.stringify(new FormData(event.currentTarget).getAll('place')));
  }
  return <form aria-label="Object results" class="space-y-3" onSubmit={submit}>
    <Label for="place">Workspace</Label>
    <Combobox items={results()} filteredItems={results()} defaultValue={initial} itemToStringLabel={item => item.label} itemToStringValue={item => item.id} name="place">
      <ComboboxInput id="place"/>
      <ComboboxContent><ComboboxList>{(item: Place) => <ComboboxItem value={item}>{item.label}</ComboboxItem>}</ComboboxList><ComboboxEmpty>No workspaces available.</ComboboxEmpty></ComboboxContent>
    </Combobox>
    <Button variant="outline" onClick={replaceResults}>Replace results</Button><Button variant="outline" onClick={emptyResults}>Empty results</Button>
    <Button type="submit">Submit workspace</Button><Button type="reset" variant="outline">Reset workspace</Button>
    <output aria-label="Submitted workspace">{submitted()}</output>
  </form>;
}

/** Demonstrate rejected requests separately from explicit owner updates. */
function ControlledForm() {
  const [open, setOpen] = createSignal(false);
  const [query, setQuery] = createSignal('App');
  const [requestedOpen, setRequestedOpen] = createSignal('none');
  const [requestedQuery, setRequestedQuery] = createSignal('none');
  const [requestedValue, setRequestedValue] = createSignal('none');
  const [submitted, setSubmitted] = createSignal('Not submitted');
  /** Report the requested state without accepting it. */
  function rejectOpen(next: boolean) { setRequestedOpen(String(next)); }
  /** Report the requested draft without accepting it. */
  function rejectQuery(next: string) { setRequestedQuery(JSON.stringify(next)); }
  /** Report selection requests while keeping Apple canonical. */
  function rejectValue(next: string | null) { setRequestedValue(String(next)); }
  /** The owner can open after a rejected opening request. */
  function ownerOpen() { setOpen(true); }
  /** The owner can close after a rejected dismissal. */
  function ownerClose() { setOpen(false); }
  /** The owner can replace a search draft independently from selection. */
  function ownerQuery() { setQuery('Ban'); }
  /** Observe the accepted value through an actual native form submission. */
  const submit: JSX.EventHandler<HTMLFormElement, SubmitEvent> = event => {
    event.preventDefault();
    setSubmitted(JSON.stringify(new FormData(event.currentTarget).getAll('fruit')));
  };
  return <form aria-label="Rejected controlled requests" class="space-y-3" onSubmit={submit}>
    <Label for="owned-fruit">Owner fruit</Label>
    <Combobox items={fruits} value="Apple" inputValue={query()} open={open()} onValueChange={rejectValue} onInputValueChange={rejectQuery} onOpenChange={rejectOpen} name="fruit">
      <ComboboxInput id="owned-fruit"/>
      <ComboboxContent><ComboboxList>{(item: string) => <ComboboxItem value={item}>{item}</ComboboxItem>}</ComboboxList>
        <Button onClick={ownerQuery}>Owner searches Banana</Button><Button onClick={ownerClose}>Owner closes</Button>
      </ComboboxContent>
    </Combobox>
    <Button onClick={ownerOpen}>Owner opens</Button><Button type="submit">Submit owned fruit</Button>
    <output aria-label="Requested open">{requestedOpen()}</output>
    <output aria-label="Requested query">{requestedQuery()}</output>
    <output aria-label="Requested value">{requestedValue()}</output>
    <output aria-label="Submitted owned fruit">{submitted()}</output>
  </form>;
}
