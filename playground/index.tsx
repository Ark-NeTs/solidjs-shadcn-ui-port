// Interactive examples exercise public package exports and app-owned state; D19.
import { NotificationCatalogExamples } from './catalog-notifications';
import { LayoutCatalogExamples } from './catalog-layout';
import { DateCatalogExamples } from './catalog-dates';
import { createSignal, Show } from 'solid-js';
import { render } from '@solidjs/web';
import { Button } from 'shadcn-solidjs-theme/ui/button';
import { Badge } from 'shadcn-solidjs-theme/ui/badge';
import { Card, CardHeader, CardTitle, CardDescription, CardAction, CardContent, CardFooter } from 'shadcn-solidjs-theme/ui/card';
import { Separator } from 'shadcn-solidjs-theme/ui/separator';
import { Skeleton } from 'shadcn-solidjs-theme/ui/skeleton';
import { Input } from 'shadcn-solidjs-theme/ui/input';
import { Textarea } from 'shadcn-solidjs-theme/ui/textarea';
import { Label } from 'shadcn-solidjs-theme/ui/label';
import { Checkbox, type CheckedState } from 'shadcn-solidjs-theme/ui/checkbox';
import { Switch } from 'shadcn-solidjs-theme/ui/switch';
import './index.css';
import { ComboboxExamples } from './combobox';
import { ComboboxContracts } from './combobox-contracts';
import { PopoverPlacement } from './popover-placement';
import { AlertDialogFocus } from './alert-dialog-focus';
import { TabsLifecycle } from './tabs-lifecycle';
import { ToggleForms } from './toggle-forms';
import { LinkNavigation } from './link-navigation';
import { NativeFields } from './native-fields';
import { CardLayout } from './card-layout';
import { MenuCatalogExamples } from './catalog-menus';
import { ModalCatalogExamples } from './catalog-modal';
import { DisplayCatalogExamples } from './catalog-display';
import { NativeCatalogExamples } from './catalog-native';
import { ProgressExamples } from './progress';
import { SliderExamples } from './slider';
import { SelectExamples } from './select';
import { Choices } from './choices';
import { Hints } from './hints';
import { Disclosures } from './disclosures';
import { SkeletonLoading } from './skeleton-loading';
import { TabsExamples, OverlayExamples } from './overlays';
const variants = ['default', 'secondary', 'outline', 'ghost', 'destructive', 'link'] as const;
/** Keep demonstration state in the application, with no data layer in components. */
function Playground() {
  const [dark, setDark] = createSignal(new URLSearchParams(location.search).has('dark'));
  const [pending, setPending] = createSignal(false);
  const [saved, setSaved] = createSignal(0);
  const [compact, setCompact] = createSignal(false);
  const [disabled, setDisabled] = createSignal(false);
  const [vertical, setVertical] = createSignal(false);
  const [custom, setCustom] = createSignal(false);
  return <div class={dark() ? 'dark min-h-screen bg-background text-foreground' : 'min-h-screen bg-background text-foreground'}
    style={custom() ? {'--primary':'oklch(0.46 0.15 155)','--primary-foreground':'oklch(0.99 0 0)','--radius':'0.8rem'} : {}} data-testid="theme">
    <main>
      <header class="flex flex-wrap items-center justify-between gap-4 border-b pb-6">
        <a href="#top" class="text-sm font-semibold tracking-wide">SOLID / FOUNDATIONS</a>
        <nav aria-label="Preview settings" class="samples">
          <Button variant="outline" aria-pressed={custom() ? "true" : "false"} onClick={() => setCustom(!custom())}>Custom theme</Button>
          <Button variant="outline" aria-pressed={dark() ? "true" : "false"} onClick={() => setDark(!dark())}>{dark() ? 'Light mode' : 'Dark mode'}</Button>
        </nav>
      </header>
      <section id="top" class="py-12">
        <Badge variant="secondary">Solid 2 · First release</Badge>
        <h1 class="mt-5 max-w-2xl text-4xl font-semibold tracking-tight sm:text-5xl">A shared language,<br />reusable building blocks.</h1>
        <p class="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground">Familiar shadcn styling. Reactive Solid components. Shared light and dark tokens, ready to compose into your next screen.</p>
        <div class="mt-6 samples"><Button as="a" href="#components">Explore components</Button><span class="text-xs text-muted-foreground">Button / Badge / Card / Separator / Skeleton / Input / Textarea / Label / Checkbox / Switch / Tabs / Popover / Alert Dialog / Combobox / Accordion / Collapsible / Tooltip / Hover Card / Radio Group / Toggle / Toggle Group / Select / Slider / Progress</span></div>
      </section>
      <p class="mb-6"><a class="underline" href="/?disclosures">Explore Accordion and Collapsible →</a> · <a class="underline" href="/?hints">Explore Tooltip and Hover Card →</a> · <a class="underline" href="/?choices">Explore Radio Group and Toggles →</a> · <a class="underline" href="/?select">Explore Select →</a> · <a class="underline" href="/?slider">Explore Slider →</a> · <a class="underline" href="/?progress">Explore Progress →</a> · <a class="underline" href="/?catalog-native">Explore native compositions →</a> · <a class="underline" href="/?catalog-display">Explore identity and navigation →</a></p>
      <Separator />
      <section id="components" class="demo-section" aria-labelledby="button-heading">
        <h2 id="button-heading">01 / Button</h2><p>Actions with clear hierarchy. Native keyboard, form, and disabled behavior.</p>
        <div class="samples">{variants.map(variant => <Button variant={variant} disabled={disabled()}>{variant}</Button>)}</div>
        <div class="samples mt-4"><Button size="xs">Extra small</Button><Button size="sm">Small</Button><Button>Default</Button><Button size="lg">Large</Button><Button size="icon" aria-label="Add item">+</Button><Button variant="outline" aria-pressed={disabled() ? "true" : "false"} onClick={() => setDisabled(!disabled())}>Disable examples</Button></div>
        <div class="snippet"><code>{'<Button variant="outline" onClick={save}>Save changes</Button>'}</code></div>
      </section>
      <section class="demo-section" aria-labelledby="badge-heading"><h2 id="badge-heading">02 / Badge</h2><p>Compact labels for status, categories, and navigation.</p><div class="samples">{variants.map(variant => <Badge variant={variant}>{variant}</Badge>)}<Badge as="a" href="#composition" variant="outline">View composition →</Badge></div></section>
      <section id="composition" class="demo-section" aria-labelledby="card-heading"><h2 id="card-heading">03 / Card</h2><p>Seven composable parts. The application owns submission and pending state.</p>
        <div class="demo-grid">
          <Card size={compact() ? 'sm' : 'default'} data-testid="example-card">
            <CardHeader><CardTitle><h3>Workspace preferences</h3></CardTitle><CardDescription>Keep your team’s workspace easy to recognize.</CardDescription><CardAction><Badge variant="outline">Preview</Badge></CardAction></CardHeader>
            <CardContent><form id="preferences" onSubmit={event => {event.preventDefault();setPending(true);}}>
              <Label for="workspace-name">Workspace name</Label><Input id="workspace-name" name="workspace" required defaultValue="North studio" class="mt-2" />
              <p class="mt-3 text-xs text-muted-foreground">Preview only. No information leaves this page.</p>
            </form></CardContent>
            <CardFooter class="flex-wrap justify-between gap-3"><span role="status" class="text-xs text-foreground">{pending() ? 'Saving preview…' : `Saved changes: ${saved()}`}</span><Button type="submit" form="preferences" disabled={pending()} aria-busy={pending() ? "true" : "false"}>Save changes</Button></CardFooter>
          </Card>
          <Card><CardHeader><CardTitle><h3>Compose, don’t duplicate</h3></CardTitle><CardDescription>Slots stay consistent across layouts.</CardDescription></CardHeader><CardContent class="space-y-4"><p class="leading-relaxed text-muted-foreground">Use your own headings, form controls, and application state. Every part forwards native attributes and refs.</p><code>CardHeader → CardContent → CardFooter</code></CardContent><CardFooter class="gap-3 flex-wrap"><Button variant="outline" aria-pressed={compact() ? "true" : "false"} onClick={() => setCompact(!compact())}>Toggle compact card</Button><Button variant="secondary" disabled={!pending()} onClick={() => {setPending(false);setSaved(saved()+1);}}>Complete preview save</Button></CardFooter></Card>
        </div>
      </section>
      <section class="demo-section" aria-labelledby="separator-heading"><h2 id="separator-heading">04 / Separator</h2><p>Decorative by default; opt into semantic separation when it adds meaning.</p><div class="samples h-16"><span>Overview</span><Separator decorative={false} orientation={vertical() ? 'vertical' : 'horizontal'} class={vertical() ? 'h-6 self-center' : 'max-w-24'} data-testid="live-separator" /><span>Activity</span><Button variant="outline" onClick={() => setVertical(!vertical())}>Change orientation</Button></div></section>
      <section class="demo-section" aria-labelledby="skeleton-heading"><h2 id="skeleton-heading">05 / Skeleton</h2><p>Quiet loading placeholders. Reduced motion is respected automatically.</p><div class="demo-grid"><Card aria-busy={pending() ? "true" : "false"}><CardContent class="pt-4"><Show when={pending()} fallback={<p>Content is ready. Save the preview above to see its loading state.</p>}><div role="status" class="sr-only">Loading preview</div><div class="samples"><Skeleton class="size-12 rounded-full" /><div class="flex-1 space-y-3"><Skeleton class="h-4 w-3/4" /><Skeleton class="h-4 w-1/2" /></div></div></Show></CardContent></Card><div class="snippet m-0"><code>{'<Loading fallback={<Skeleton class="h-24 w-full" />}><Content /></Loading>'}</code></div></div></section>
      <section class="demo-section" aria-labelledby="fields-heading"><h2 id="fields-heading">06–08 / Input, Textarea &amp; Label</h2><p>Native fields, explicit labels, and drafts owned by your application.</p><FormExamples /></section>
      <section class="demo-section" aria-labelledby="toggles-heading"><h2 id="toggles-heading">09–10 / Checkbox &amp; Switch</h2><p>Selections and settings with native labels, keyboard access, and form behavior.</p><ToggleExamples /></section>
      <section class="demo-section" aria-labelledby="tabs-heading"><h2 id="tabs-heading">11 / Tabs</h2><p>Named panels, roving focus, and automatic or manual activation.</p><TabsExamples/></section>
      <section class="demo-section" aria-labelledby="overlays-heading"><h2 id="overlays-heading">12–13 / Popover &amp; Alert Dialog</h2><p>Contextual editing and explicit confirmation, with focus managed by the browser.</p><OverlayExamples/></section>
      <section class="demo-section" aria-labelledby="combobox-heading"><h2 id="combobox-heading">14 / Combobox</h2><p>Search, choose, clear, and reset. Selection stays with its owner.</p><ComboboxExamples/></section>
      <footer class="mt-16 border-t pt-6 text-xs text-muted-foreground">Solid components · Shared semantic tokens · No application services</footer>
    </main>
  </div>;
}
/** Demonstrate native validation/reset and controlled drafts without application services. */
function FormExamples() {
  const [notes, setNotes] = createSignal('Please leave deliveries at reception.');
  const [submitted, setSubmitted] = createSignal('');
  const [invalid, setInvalid] = createSignal(false);
  return <div class="demo-grid">
    <Card><CardHeader><CardTitle><h3>Delivery instructions</h3></CardTitle><CardDescription>A local form preview. Edit, validate, or reset your draft.</CardDescription></CardHeader>
      <CardContent><form id="delivery" class="space-y-5" onSubmit={event => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        setSubmitted(`Preview saved for ${data.get('email')}: ${data.get('notes')}`);
      }} onReset={() => {setNotes('Please leave deliveries at reception.');setSubmitted('');}}>
        <div class="space-y-2"><Label for="contact-email">Contact email (required)</Label><Input id="contact-email" name="email" type="email" autocomplete="email" required defaultValue="hello@example.com" aria-describedby="email-help" /><p id="email-help" class="text-xs text-muted-foreground">Used only in this local preview.</p></div>
        <div class="space-y-2"><Label for="delivery-notes">Delivery notes (required)</Label><Textarea id="delivery-notes" name="notes" required maxlength={240} rows={3} defaultValue="Please leave deliveries at reception." value={notes()} onInput={event => setNotes(event.currentTarget.value)} aria-describedby="notes-help" /><p id="notes-help" class="text-xs text-muted-foreground">{notes().length}/240 characters. No information leaves this page.</p></div>
      </form></CardContent><CardFooter class="flex-wrap gap-3"><Button type="submit" form="delivery">Save delivery preview</Button><Button type="reset" form="delivery" variant="outline">Reset delivery draft</Button><p role="status" data-testid="delivery-status" class="w-full break-words text-xs">{submitted()}</p></CardFooter>
    </Card>
    <Card><CardHeader><CardTitle><h3>Field states</h3></CardTitle><CardDescription>Errors, read-only values, disabled fields, and file input.</CardDescription></CardHeader><CardContent class="space-y-5">
      <div class="space-y-2"><Label for="reference-code">Reference code</Label><Input id="reference-code" placeholder="e.g. NORTH-01" aria-invalid={invalid() ? 'true' : 'false'} aria-describedby={invalid() ? 'reference-error' : undefined} /><Show when={invalid()}><p id="reference-error" class="text-xs text-destructive-emphasis">Enter the reference from your confirmation, then clear this preview error.</p></Show><Button variant="outline" size="sm" aria-pressed={invalid() ? 'true' : 'false'} onClick={() => setInvalid(!invalid())}>{invalid() ? 'Clear preview error' : 'Show preview error'}</Button></div>
      <div class="space-y-2"><Label for="account-id">Account ID (read only)</Label><Input id="account-id" readonly value="NORTH-001" /></div>
      <div class="space-y-2"><Input id="locked-input" class="peer" disabled value="Managed by your team" /><Label for="locked-input">Managed contact (disabled)</Label></div>
      <div class="space-y-2"><Textarea id="locked-notes" class="peer" disabled defaultValue="Notes are locked for this example." /><Label for="locked-notes">Locked notes (disabled)</Label></div>
      <div class="space-y-2"><Label for="attachment">Attachment</Label><Input id="attachment" type="file" accept=".txt" /></div>
    </CardContent></Card>
  </div>;
}
/** Keep editable settings, rejected requests and submit feedback in the example owner. */
function ToggleExamples() {
  const [selection, setSelection] = createSignal<CheckedState>('indeterminate');
  const [enabled, setEnabled] = createSignal(true);
  const [locked, setLocked] = createSignal(false);
  const [result, setResult] = createSignal('');
  const [rejected, setRejected] = createSignal(false);
  return <div class="demo-grid">
    <Card><CardHeader><CardTitle><h3>Notification preferences</h3></CardTitle><CardDescription>Try keyboard controls and native form validation. This preview stores nothing.</CardDescription></CardHeader><CardContent>
      <form id="notifications" class="space-y-6" onSubmit={event => {event.preventDefault();setResult(JSON.stringify(Object.fromEntries(new FormData(event.currentTarget))));}}>
        <div class="flex items-start gap-3"><Checkbox id="terms" name="terms" value="accepted" required aria-describedby="terms-help"/><div class="space-y-2"><Label for="terms">Accept notification terms (required)</Label><p id="terms-help" class="text-xs text-muted-foreground">Select before saving these local preferences.</p></div></div>
        <div class="flex items-center gap-3"><Checkbox id="weekly" name="weekly" defaultChecked/><Label for="weekly">Weekly summary</Label></div>
        <div class="flex items-center gap-3"><Switch id="alerts" name="alerts" defaultChecked/><Label for="alerts">Delivery alerts</Label></div>
        <div class="flex items-center gap-3"><Switch id="quiet" name="quiet" size="sm"/><Label for="quiet">Quiet hours</Label></div>
      </form>
    </CardContent><CardFooter class="flex-wrap gap-3"><Button type="submit" form="notifications">Save notification preview</Button><Button type="reset" form="notifications" variant="outline" onClick={() => setResult('')}>Reset notifications</Button><p role="status" data-testid="notification-status" class="w-full break-all text-xs">{result()}</p></CardFooter></Card>
    <Card><CardHeader><CardTitle><h3>Controlled states</h3></CardTitle><CardDescription>Parent-owned values, mixed selection, and an explicit recovery path.</CardDescription></CardHeader><CardContent class="space-y-6">
      <div class="flex items-center gap-3"><Checkbox id="select-all" checked={selection()} onCheckedChange={setSelection}/><Label for="select-all">Select all categories</Label><Badge variant="secondary">{String(selection())}</Badge></div>
      <div class="flex items-center gap-3"><Switch id="enabled" checked={enabled()} onCheckedChange={setEnabled} disabled={locked()}/><Label for="enabled">Live updates</Label><Badge variant="secondary">{enabled() ? 'On' : 'Off'}</Badge></div>
      <div class="samples"><Button variant="outline" size="sm" onClick={() => setSelection('indeterminate')}>Restore mixed selection</Button><Button variant="outline" size="sm" onClick={() => setLocked(!locked())}>{locked() ? 'Unlock live updates' : 'Lock live updates'}</Button></div>
      <div class="flex items-center gap-3"><Checkbox id="locked-check" disabled defaultChecked/><Label for="locked-check">Required by your team (disabled)</Label></div>
      <div class="flex items-center gap-3"><Switch id="readonly-switch" readonly defaultChecked/><Label for="readonly-switch">Audit notifications (read only)</Label></div>
      <div class="space-y-2"><div class="flex items-center gap-3"><Switch id="rejected-switch" checked={false} onCheckedChange={() => setRejected(true)} aria-invalid={rejected() ? 'true' : 'false'} aria-describedby={rejected() ? 'toggle-error' : undefined}/><Label for="rejected-switch">Restricted preview setting</Label></div><Show when={rejected()}><p id="toggle-error" class="text-xs text-destructive-emphasis">This preview rejects the change. Your previous setting is preserved.</p><Button size="sm" variant="outline" onClick={() => setRejected(false)}>Dismiss setting error</Button></Show></div>
      <div class="flex items-center gap-3" dir="rtl"><Switch id="rtl-switch" defaultChecked/><Label for="rtl-switch">RTL switch example</Label></div>
    </CardContent></Card>
  </div>;
}
/** Select focused acceptance examples without changing the main gallery layout. */
function Preview() {
  const query = new URLSearchParams(location.search);
  if (query.has('catalog-dates')) return <DateCatalogExamples/>;
  if (query.has('catalog-layout')) return <LayoutCatalogExamples/>;
  if (query.has('catalog-notifications')) return <NotificationCatalogExamples/>;
  if (query.has('catalog-menus')) return <MenuCatalogExamples/>;
  if (query.has('catalog-modal')) return <ModalCatalogExamples/>;
  if (query.has('catalog-display')) return <DisplayCatalogExamples/>;
  if (query.has('catalog-native')) return <NativeCatalogExamples/>;
  if (query.has('progress')) return <ProgressExamples/>;
  if (query.has('slider')) return <SliderExamples/>;
  if (query.has('select')) return <SelectExamples/>;
  if (query.has('choices')) return <Choices/>;
  if (query.has('hints')) return <Hints/>;
  if (query.has('disclosures')) return <Disclosures/>;
  if (query.has('skeleton-loading')) return <SkeletonLoading/>;
  if (query.has('card-layout')) return <CardLayout/>;
  if (query.has('native-fields')) return <NativeFields/>;
  if (query.has('link-navigation')) return <LinkNavigation/>;
  if (query.has('toggle-forms')) return <ToggleForms/>;
  if (query.has('tabs-lifecycle')) return <TabsLifecycle/>;
  if (query.has('alert-dialog-focus')) return <AlertDialogFocus/>;
  if (query.has('popover-placement')) return <PopoverPlacement/>;
  if (query.has('combobox-contracts')) return <ComboboxContracts/>;
  return <Playground/>;
}
render(() => <Preview/>, document.getElementById('app')!);
