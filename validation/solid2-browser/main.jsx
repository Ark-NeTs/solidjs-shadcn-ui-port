// Browser-only Kobalte acceptance probes for Solid 2; informs the D19 library boundary.
import { createSignal, Show } from 'solid-js';
import { render } from '@solidjs/web';
import * as Drawer from '@kobalte/core/drawer';
import { DialogProbe, PresenceProbe } from './dialog-presence.jsx';
import * as Resizable from '@kobalte/core/resizable';
import * as Calendar from '@kobalte/core/calendar';
import { OtpProbe } from './otp-probe.jsx';
import { I18nProvider, useLocale } from '@kobalte/core/i18n';
import * as Tabs from '@kobalte/core/tabs';
import './style.css';
const params = new URLSearchParams(location.search);
/** Render Drawer state for assertions without replacing its gesture handlers. */
function DrawerState(props) {
  const state = Drawer.useContext();
  return <output data-testid={props.id || "snap"}>{state.activeSnapPoint()}</output>;
}
/** Exercise a controlled modal Drawer, including its portal and native scroll area. */
function DrawerProbe() {
  const [open, setOpen] = createSignal(false);
  window.drawerControl = { setOpen };
  return <>
    <output data-testid="open">{String(open())}</output>
    <Drawer.Root open={open()} onOpenChange={setOpen} snapPoints={[0, 0.5, 1]} defaultSnapPoint={1}>
      <Drawer.Trigger>Open drawer</Drawer.Trigger>
      <Drawer.Portal>
        <Drawer.Overlay class="overlay" data-testid="overlay" />
        <Drawer.Content class="drawer" data-testid="drawer" onEscapeKeyDown={event => { if (params.has("preventEscape")) event.preventDefault(); }}>
          <div class="grip" data-testid="grip">Drag here</div>
          <Drawer.Title>Drawer probe</Drawer.Title>
          <Drawer.Description>Keyboard, focus and gesture fixture.</Drawer.Description>
          <DrawerState />
          <label>Drawer input<input aria-label="Drawer input" /></label>
          <div class="scroll" data-testid="drawer-scroll"><div style={{height:'600px'}}>Scrollable content</div></div>
          <Show when={params.has('nested')}><Drawer.Root><Drawer.Trigger>Open nested drawer</Drawer.Trigger><Drawer.Portal><Drawer.Overlay class="overlay" /><Drawer.Content class="drawer"><DrawerState id="nested-snap" /><Drawer.Title>Nested drawer</Drawer.Title><Drawer.Description>Topmost layer check.</Drawer.Description><Drawer.CloseButton>Close nested drawer</Drawer.CloseButton></Drawer.Content></Drawer.Portal></Drawer.Root></Show>
          <Drawer.CloseButton>Close drawer</Drawer.CloseButton>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
    <button>Outside focus target</button>
  </>;
}
/** Expose public resize/collapse commands inside the Resizable provider. */
function ResizeActions() {
  const state = Resizable.useContext();
  return <><button onClick={() => state.collapse(0)}>Collapse first</button><button onClick={() => state.expand(0)}>Expand first</button></>;
}
/** Validate controlled panel sizing, constraints, pointer and keyboard input. */
function ResizableProbe() {
  const [sizes, setSizes] = createSignal([0.5, 0.5]);
  window.__resizeEvents = [];
  window.__changeRetainedSizes = setSizes;
  return <>
    <output data-testid="sizes">{JSON.stringify(sizes())}</output>
    <Resizable.Root class="resizable" orientation={params.get('orientation') || 'horizontal'} sizes={sizes()} onSizesChange={setSizes} keyboardDelta={0.1}>
      <Resizable.Panel class="panel" data-testid="panel-one" onResize={size => window.__resizeEvents.push(size)} minSize={0.2} maxSize={0.8} collapsible collapsedSize={0}>First panel<ResizeActions /></Resizable.Panel>
      <Resizable.Handle aria-label="Resize panels" class="handle" />
      <Resizable.Panel class="panel" minSize={0.2}>Second panel</Resizable.Panel>
    </Resizable.Root>
  </>;
}
/** Keep calendar test dates independent of the machine's current date. */
function october(day) { return new Date(2026, 9, day, 12); }
/** Format a native Date without changing its local calendar day. */
function dateOnly(value) { return `${value.getFullYear()}-${String(value.getMonth()+1).padStart(2,'0')}-${String(value.getDate()).padStart(2,'0')}`; }
/** Print Date values and ranges using the local calendar date. */
function dateText(value) {
  if (!value) return '';
  if (Array.isArray(value)) return value.map(dateOnly).join(',');
  if (value instanceof Date) return dateOnly(value);
  return `${dateOnly(value.start)}/${dateOnly(value.end)}`;
}
/** Render the documented table/row/cell composition with controlled selection. */
function CalendarProbe() {
  const mode = params.get('mode') || 'single';
  const [value, setValue] = createSignal(mode === 'multiple' ? [] : null);
  return <>
    <output data-testid="date">{dateText(value())}</output>
    <Calendar.Root selectionMode={mode} value={value()} onChange={setValue} defaultFocusedValue={october(7)} minValue={october(1)} maxValue={new Date(2026,10,30,12)} isDateUnavailable={date => date.getDate()===10}>
      <Calendar.Header><Calendar.PrevTrigger>Previous month</Calendar.PrevTrigger><Calendar.Heading /><Calendar.NextTrigger>Next month</Calendar.NextTrigger></Calendar.Header>
      <Calendar.Grid><Calendar.GridHeader><Calendar.GridHeaderRow>{day => <Calendar.GridHeaderCell>{day()}</Calendar.GridHeaderCell>}</Calendar.GridHeaderRow></Calendar.GridHeader>
        <Calendar.GridBody>{week => <Calendar.GridBodyRow weekIndex={week()}>{date => <Show when={date()}><Calendar.GridBodyCell date={date()}><Calendar.GridBodyCellTrigger /></Calendar.GridBodyCell></Show>}</Calendar.GridBodyRow>}</Calendar.GridBody>
      </Calendar.Grid>
    </Calendar.Root>
  </>;
}
/** Reveal provider direction and test a consumer's horizontal keyboard behavior. */
function DirectionConsumer(props) {
  const locale = useLocale();
  return <section data-testid={props.id}>
    <output data-testid={`${props.id}-locale`}>{locale.locale()}</output><output data-testid={`${props.id}-direction`}>{locale.direction()}</output>
    <Tabs.Root defaultValue="one"><Tabs.List aria-label={`${props.id} tabs`}><Tabs.Trigger value="one">One</Tabs.Trigger><Tabs.Trigger value="two">Two</Tabs.Trigger><Tabs.Trigger value="three">Three</Tabs.Trigger></Tabs.List><Tabs.Content value="one">First</Tabs.Content><Tabs.Content value="two">Second</Tabs.Content><Tabs.Content value="three">Third</Tabs.Content></Tabs.Root>
  </section>;
}
/** Compare locale-derived RTL, DOM-only RTL and nested locale overrides. */
function DirectionProbe() {
  const [locale, setLocale] = createSignal('en-US');
  return <>
    <I18nProvider locale={locale()}><DirectionConsumer id="dynamic" /></I18nProvider>
    <button onClick={() => setLocale('ar-SA')}>Set Arabic locale</button>
    <I18nProvider locale="en-US"><div dir="rtl"><DirectionConsumer id="explicit-rtl" /></div></I18nProvider>
    <I18nProvider locale="ar-SA"><DirectionConsumer id="arabic" /><I18nProvider locale="en-US"><DirectionConsumer id="nested-english" /></I18nProvider></I18nProvider>
  </>;
}
const probes = {dialog:DialogProbe,presence:PresenceProbe,drawer:DrawerProbe,resizable:ResizableProbe,calendar:CalendarProbe,otp:OtpProbe,direction:DirectionProbe};
const Probe = probes[params.get('case')] || DrawerProbe;
let dispose;
/** Remove the rendered ownership tree so browser tests can check cleanup. */
function unmount() { dispose?.(); dispose = undefined; }
/** Mount exactly one fresh fixture, without retaining its previous ownership tree. */
function mount() { unmount(); dispose = render(() => <Probe />, document.getElementById('app')); }
document.getElementById('unmount').onclick = unmount;
document.getElementById('mount').onclick = mount;
window.harness = { mount, unmount };
mount();
