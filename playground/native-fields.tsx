// Native field acceptance examples use public exports and owner-controlled labels; D19/D90.
import { createSignal, For, Show } from 'solid-js';
import { Input } from 'shadcn-solidjs-theme/ui/input';
import { Textarea } from 'shadcn-solidjs-theme/ui/textarea';
import { Label } from 'shadcn-solidjs-theme/ui/label';
import { Button } from 'shadcn-solidjs-theme/ui/button';
const types = ['text', 'search', 'tel', 'url', 'password', 'email'] as const;
const lines = Array.from({ length: 40 }, (_, index) => `Line ${index + 1}: delivery instructions`).join('\n');

/** Exercise native constraints and submission without application validation adapters. */
function NativeInputs() {
  const [submitted, setSubmitted] = createSignal('');
  return <form aria-label="Native inputs" class="grid gap-3 max-w-lg" onSubmit={event => {
    event.preventDefault();
    setSubmitted(JSON.stringify(Object.fromEntries(new FormData(event.currentTarget))));
  }} onReset={() => setSubmitted('')}>
    <Label for="quantity">Quantity</Label><Input id="quantity" name="quantity" type="number" min="1" max="9" step="2" defaultValue="3" required/>
    <Label for="date">Date</Label><Input id="date" name="date" type="date" min="2026-10-07" max="2026-10-10" defaultValue="2026-10-08" required/>
    <Label for="time">Time</Label><Input id="time" name="time" type="time" min="08:00" max="18:00" step="900" defaultValue="09:00" required/>
    <Label for="local">Local date and time</Label><Input id="local" name="local" type="datetime-local" min="2026-10-08T08:00" max="2026-10-08T18:00" step="900" defaultValue="2026-10-08T09:00" required/>
    <Label for="range">Level</Label><Input id="range" name="range" type="range" min="0" max="10" step="2" defaultValue="4"/>
    <For each={types}>{type => <><Label for={type}>{type} value</Label><Input id={type} name={type} type={type}/></>}</For>
    <div class="samples"><Button type="submit">Submit native values</Button><Button type="reset">Reset native values</Button></div>
    <output data-testid="native-values">{submitted()}</output>
  </form>;
}

/** Expose native scrolling, resizing and readonly behavior with explicit sizing overrides. */
function NativeTextarea() {
  const [readonly, setReadonly] = createSignal(true);
  const [submitted, setSubmitted] = createSignal('');
  return <form class="grid gap-4 max-w-lg" onSubmit={event => {
    event.preventDefault(); setSubmitted(String(new FormData(event.currentTarget).get('notes')));
  }}>
    <Label for="notes">Scrollable notes</Label>
    <Textarea id="notes" name="notes" readonly={readonly()} defaultValue={lines}
      class="field-sizing-fixed h-28 max-h-72 resize-y overflow-auto"/>
    <Button onClick={() => setReadonly(!readonly())}>{readonly() ? 'Allow editing' : 'Make read only'}</Button>
    <Button type="submit">Submit notes</Button>
    <output data-testid="notes-value" class="whitespace-pre-wrap">{submitted()}</output>
  </form>;
}

/** Reassociate the same label and controls, preserving their drafts and DOM identity. */
function LiveLabel() {
  const [target, setTarget] = createSignal('first');
  const [renamed, setRenamed] = createSignal(false);
  const [disabled, setDisabled] = createSignal(false);
  const secondId = () => renamed() ? 'renamed-notes' : 'second';
  return <div class="grid gap-4 max-w-lg">
    <div class="samples">
      <Button onClick={() => setTarget(target() === 'first' ? 'second' : 'first')}>Move label</Button>
      <Button onClick={() => setRenamed(!renamed())}>Rename textarea ID</Button>
      <Button onClick={() => setDisabled(!disabled())}>{disabled() ? 'Enable textarea' : 'Disable textarea'}</Button>
    </div>
    <Label data-testid="live-label" for={target() === 'first' ? 'first' : secondId()}><span data-testid="label-text">Active draft</span></Label>
    <Input id="first" data-testid="first-draft" defaultValue="Input draft"/>
    <Textarea id={secondId()} data-testid="second-draft" defaultValue="Textarea draft" disabled={disabled()}
      onKeyDown={event => { if (event.key === 'F2') setTarget(target() === 'first' ? 'second' : 'first'); }}/>
    <p>F2 in the textarea moves the label while preserving the editing focus.</p>
    <Button>After drafts</Button>
  </div>;
}

/** Select the requested field contract without changing the main component gallery. */
export function NativeFields() {
  const query = new URLSearchParams(location.search);
  return <main><h1>Native field contracts</h1>
    <Show when={query.has('textarea')} fallback={<Show when={query.has('labels')} fallback={<NativeInputs/>}><LiveLabel/></Show>}>
      <NativeTextarea/>
    </Show>
  </main>;
}
